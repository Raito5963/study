"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

export default function ExercizePage() {
    // 動的パラメータ(exId)の取得
    const params = useParams();
    const exId = params.exId as string;
    const router = useRouter();

    // ページデータ：タイトル、説明、問題配列
    const [pageData, setPageData] = useState<{
        title: string;
        description: string;
        problems: { problem: string; answer: string; explanation: string }[];
    } | null>(null);

    // 現在出題中の問題
    const [currentProblem, setCurrentProblem] = useState<{
        problem: string;
        answer: string;
        explanation: string;
    } | null>(null);

    // ユーザーの回答入力
    const [userAnswer, setUserAnswer] = useState('');
    // 判定結果のフィードバック
    const [feedback, setFeedback] = useState('');

    // 統計情報
    const [total, setTotal] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);

    // 不正解時に「次の問題へ」ボタンを表示するためのフラグ
    const [showNextButton, setShowNextButton] = useState(false);

    // Firestoreからページデータを読み込む
    useEffect(() => {
        if (exId) {
            const fetchData = async () => {
                const docRef = doc(db, 'pages', exId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPageData({
                        title: data.title,
                        description: data.description,
                        problems: data.problems || [],
                    });
                }
            };
            fetchData();
        }
    }, [exId]);

    // ランダムに問題を選択する関数
    const selectRandomProblem = () => {
        if (pageData && pageData.problems.length > 0) {
            const idx = Math.floor(Math.random() * pageData.problems.length);
            setCurrentProblem(pageData.problems[idx]);
            setUserAnswer('');
            setFeedback('');
            setShowNextButton(false);
        } else {
            setCurrentProblem(null);
        }
    };

    // ページデータ読み込み後に初期問題を選択
    useEffect(() => {
        if (pageData) {
            selectRandomProblem();
        }
    }, [pageData]);

    // 回答送信時の処理
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
            // 正解の場合は自動で1秒後に次の問題へ
            setTimeout(() => {
                selectRandomProblem();
            }, 1000);
        } else {
            setFeedback(`不正解。解説: ${currentProblem.explanation}`);
            setIncorrect(prev => prev + 1);
            // 不正解の場合は「次の問題へ」ボタンを表示
            setShowNextButton(true);
        }
    };

    // 統計リセット処理
    const handleResetStats = () => {
        setTotal(0);
        setCorrect(0);
        setIncorrect(0);
    };

    if (!pageData) return <div>Loading...</div>;

    return (
        <div style={{ padding: '16px' }}>
            <Typography variant="h4" gutterBottom>
                {pageData.title}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                {pageData.description}
            </Typography>

            {currentProblem ? (
                <div style={{ marginTop: '24px' }}>
                    <Typography variant="h6">問題:</Typography>
                    <Typography variant="body1" style={{ marginBottom: '16px' }}>
                        {currentProblem.problem}
                    </Typography>
                    <TextField
                        label="回答を入力"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        fullWidth
                    />
                    <Button
                        onClick={handleSubmitAnswer}
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '16px' }}
                    >
                        回答
                    </Button>
                    {feedback && (
                        <Typography variant="h6" style={{ marginTop: '16px' }}>
                            {feedback}
                        </Typography>
                    )}
                    {showNextButton && (
                        <Button
                            onClick={() => selectRandomProblem()}
                            variant="contained"
                            color="primary"
                            style={{ marginTop: '16px' }}
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
                    style={{ marginRight: '16px' }}
                >
                    集計をリセット
                </Button>
                <Button onClick={() => router.push('/exercize')} variant="contained">
                    やめる
                </Button>
            </div>
        </div>
    );
}
