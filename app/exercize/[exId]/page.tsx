"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { TextField, Button, Typography, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Paper } from '@mui/material';
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

    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [total, setTotal] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);

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

    useEffect(() => {
        if (pageData) {
            selectRandomProblem();
        }
    }, [pageData]);

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
                selectRandomProblem();
            }, 1000);
        } else {
            const feedbackMessage = `不正解。\n正解：${currentProblem.answer}${currentProblem.explanation ? `\n解説：${currentProblem.explanation}` : ''}`;
            setFeedback(feedbackMessage);
            setIncorrect(prev => prev + 1);
            setShowNextButton(true);
        }
    };

    const handleResetStats = () => {
        setTotal(0);
        setCorrect(0);
        setIncorrect(0);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmitAnswer();
        }
        if (showNextButton && e.key === 'Enter') {
            selectRandomProblem();
        }
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
                            <span dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
                        </Typography>
                    )}
                    {showNextButton && (
                        <Button
                            onClick={() => selectRandomProblem()}
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
