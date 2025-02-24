"use client";
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import {
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

export default function ExercizePage() {
    const params = useParams();
    const exId = params.exId as string;
    const router = useRouter();

    const [pageData, setPageData] = useState<{
        title: string;
        description: string;
        problems: { problem: string; answer: string; explanation: string }[];
    } | null>(null);

    const [currentProblem, setCurrentProblem] = useState<{
        problem: string;
        answer: string;
        explanation: string;
    } | null>(null);

    // 順番モード用の状態
    const [sequentialMode, setSequentialMode] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [total, setTotal] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);

    // ランダム問題選択関数（useCallbackでメモ化）
    const selectRandomProblem = useCallback(() => {
        if (pageData && pageData.problems.length > 0) {
            const idx = Math.floor(Math.random() * pageData.problems.length);
            setCurrentProblem(pageData.problems[idx]);
            setUserAnswer('');
            setFeedback('');
            setShowNextButton(false);
        } else {
            setCurrentProblem(null);
        }
    }, [pageData]);

    // ページデータの取得（exIdが変わったときだけ実行）
    useEffect(() => {
        if (exId) {
            const fetchData = async () => {
                const docRef = doc(db, 'pages', exId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const problems = data.problems || [];
                    setPageData({
                        title: data.title,
                        description: data.description,
                        problems,
                    });
                    // データ取得時は順番モードなら先頭の問題を、
                    // ランダムモードなら初期状態で問題を1度だけ設定
                    if (problems.length > 0) {
                        if (sequentialMode) {
                            setCurrentIndex(0);
                            setCurrentProblem(problems[0]);
                        }
                    }
                }
            };
            fetchData();
        }
    }, [exId]); // exIdのみ依存

    // ページデータが取得済みで、ランダムモードの場合、初期問題を1度だけ設定
    useEffect(() => {
        if (pageData && !sequentialMode && !currentProblem) {
            selectRandomProblem();
        }
    }, [pageData, sequentialMode, currentProblem, selectRandomProblem]);

    // 順番モードの場合、currentIndex 更新に合わせて現在の問題を設定
    useEffect(() => {
        if (pageData && sequentialMode) {
            if (pageData.problems.length > 0 && currentIndex < pageData.problems.length) {
                setCurrentProblem(pageData.problems[currentIndex]);
                setUserAnswer('');
                setFeedback('');
                setShowNextButton(false);
            }
        }
    }, [currentIndex, pageData, sequentialMode]);

    // 順番モードで次の問題へ進む関数
    const handleNextProblem = () => {
        if (pageData && currentIndex < pageData.problems.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setFeedback('');
            setShowNextButton(false);
        }
    };

    // 回答送信処理（正解の場合はモードに合わせて次の問題を表示）
    const handleSubmitAnswer = () => {
        if (!currentProblem) return;
        if (!userAnswer.trim()) {
            alert('回答を入力してください。');
            return;
        }
        setTotal(prev => prev + 1);
        if (userAnswer.trim() === currentProblem.answer.trim()) {
            setFeedback('正解！');
            setCorrect(prev => prev + 1);
            setTimeout(() => {
                if (sequentialMode) {
                    handleNextProblem();
                } else {
                    selectRandomProblem();
                }
            }, 1000);
        } else {
            const feedbackMessage = `不正解。\n正解：${currentProblem.answer}${currentProblem.explanation ? `\n解説：${currentProblem.explanation}` : ''
                }`;
            setFeedback(feedbackMessage);
            setIncorrect(prev => prev + 1);
            setShowNextButton(true);
        }
    };

    // 集計リセット処理
    const handleResetStats = () => {
        setTotal(0);
        setCorrect(0);
        setIncorrect(0);
    };

    // Enter キー押下時の処理（回答送信 or 次の問題へ）
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (showNextButton) {
                sequentialMode ? handleNextProblem() : selectRandomProblem();
            } else {
                handleSubmitAnswer();
            }
        }
    };

    return !pageData ? (
        <div>Loading...</div>
    ) : (
        <div style={{ padding: '16px' }}>
            <Typography variant="h4" gutterBottom>
                {pageData.title}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                {pageData.description}
            </Typography>

            {/* チェックボックスでモード切替 */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={sequentialMode}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setSequentialMode(checked);
                            // モード切替時に初期状態にリセット
                            if (pageData && pageData.problems.length > 0) {
                                if (checked) {
                                    setCurrentIndex(0);
                                    setCurrentProblem(pageData.problems[0]);
                                } else {
                                    // ランダムモードになったら、今後はユーザー操作時のみ更新する
                                    // （ここでは既存の問題をそのまま保持）
                                }
                            }
                        }}
                        color="primary"
                    />
                }
                label="順番モード"
            />

            {currentProblem ? (
                <div style={{ marginTop: '24px' }}>
                    <Card elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                            問題:
                        </Typography>
                        <Typography
                            variant="body1"
                            style={{
                                marginBottom: '16px',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                        >
                            {currentProblem.problem}
                        </Typography>
                    </Card>

                    <TextField
                        label="回答を入力"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        fullWidth
                        onKeyDown={handleKeyPress}
                        style={{ marginTop: '16px', marginBottom: '16px', fontSize: '1.2rem' }}
                    />
                    <Button
                        onClick={handleSubmitAnswer}
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '16px', padding: '10px 20px', fontSize: '1rem' }}
                    >
                        回答
                    </Button>
                    {feedback && (
                        <Typography variant="h6" style={{ marginTop: '16px', fontWeight: 'bold' }}>
                            <span
                                dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }}
                            />
                        </Typography>
                    )}
                    {showNextButton && (
                        <Button
                            onClick={() =>
                                sequentialMode ? handleNextProblem() : selectRandomProblem()
                            }
                            variant="contained"
                            color="primary"
                            style={{ marginTop: '16px', padding: '10px 20px', fontSize: '1rem' }}
                        >
                            次の問題へ
                        </Button>
                    )}
                </div>
            ) : (
                <Typography variant="body1">問題がありません。</Typography>
            )}

            <Card style={{ marginTop: '32px' }}>
                <CardContent>
                    <Typography variant="h6">集計</Typography>
                    <Typography variant="body1">回答数: {total}</Typography>
                    <Typography variant="body1">正答数: {correct}</Typography>
                    <Typography variant="body1">誤答数: {incorrect}</Typography>
                    <Typography variant="body1">
                        正答率: {total > 0 ? ((correct / total) * 100).toFixed(2) : 0}%
                    </Typography>
                </CardContent>
            </Card>

            <div style={{ marginTop: '16px' }}>
                <Button
                    onClick={handleResetStats}
                    variant="contained"
                    color="secondary"
                    style={{ marginRight: '16px', padding: '10px 20px', fontSize: '1rem' }}
                >
                    集計をリセット
                </Button>
                <Button
                    onClick={() => router.push('/exercize')}
                    variant="contained"
                    color="error"
                    style={{ padding: '10px 20px', fontSize: '1rem' }}
                >
                    やめる
                </Button>
            </div>
        </div>
    );
}
