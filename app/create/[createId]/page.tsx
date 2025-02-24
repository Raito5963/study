"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Paper,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// 回答の正規化関数
function normalizeAnswer(answer: string): string {
    return answer.trim().replace(/\s+/g, ' ').toLowerCase();
}

// 子コンポーネント：各問題用のアコーディオン
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function ProblemAccordion({
    initialProblem,
    index,
    onUpdate,
    onDelete,
}: {
    initialProblem: { problem: string; answer: string; explanation: string };
    index: number;
    onUpdate: (
        index: number,
        updated: { problem: string; answer: string; explanation: string }
    ) => void;
    onDelete: (index: number) => void; // 削除関数
}) {
    const [editProblem, setEditProblem] = useState(initialProblem.problem);
    const [editAnswer, setEditAnswer] = useState(initialProblem.answer);
    const [editExplanation, setEditExplanation] = useState(initialProblem.explanation);

    const handleUpdate = () => {
        if (!editProblem.trim() || !editAnswer.trim()) {
            alert('問題と解答は必須です。');
            return;
        }
        const normalized = normalizeAnswer(editAnswer);
        onUpdate(index, {
            problem: editProblem,
            answer: normalized,
            explanation: editExplanation,
        });
    };

    const handleDelete = () => {
        onDelete(index); // 削除処理
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUpdate(); // Enterで更新
        }
    };

    return (
        <Accordion sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{initialProblem.problem}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                        label="問題"
                        value={editProblem}
                        onChange={(e) => setEditProblem(e.target.value)}
                        fullWidth
                        size="small"
                        onKeyDown={handleKeyPress}
                    />
                    <TextField
                        label="解答"
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        fullWidth
                        size="small"
                        onKeyDown={handleKeyPress}
                    />
                    <TextField
                        label="解説"
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        fullWidth
                        size="small"
                        onKeyDown={handleKeyPress}
                    />
                </Box>
            </AccordionDetails>
            <AccordionActions>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button onClick={handleUpdate} variant="contained" color="primary">
                        変更
                    </Button>
                    {/* アイコンボタンを追加するため、ボタンの位置を修正 */}
                    <IconButton onClick={handleDelete} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </AccordionActions>
        </Accordion>
    );
}


export default function CreatePage() {
    const params = useParams();
    const createId = params.createId as string;
    const router = useRouter();

    const [pageData, setPageData] = useState<{ title: string; description: string } | null>(null);
    const [problem, setProblem] = useState('');
    const [answer, setAnswer] = useState('');
    const [explanation, setExplanation] = useState('');
    const [problems, setProblems] = useState<
        { problem: string; answer: string; explanation: string }[]
    >([]);

    useEffect(() => {
        if (createId) {
            const fetchPageData = async () => {
                const docRef = doc(db, 'pages', createId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPageData({ title: data.title, description: data.description });
                    setProblems(data.problems || []);
                } else {
                    setPageData({ title: '', description: '' });
                    setProblems([]);
                }
            };
            fetchPageData();
        }
    }, [createId]);

    const handleAddProblem = () => {
        if (!problem.trim() || !answer.trim()) {
            alert('問題と解答は必須です。');
            return;
        }
        const normalized = normalizeAnswer(answer);
        setProblems([...problems, { problem, answer: normalized, explanation }]);
        setProblem('');
        setAnswer('');
        setExplanation('');
    };

    const handleSave = async () => {
        if (pageData && createId) {
            const docRef = doc(db, 'pages', createId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, {
                    title: pageData.title,
                    description: pageData.description,
                    problems: problems,
                });
                alert('保存しました');
            } else {
                await setDoc(docRef, {
                    title: pageData.title,
                    description: pageData.description,
                    problems: problems,
                });
                alert('新しいページを作成しました');
            }
        }
    };

    const handleDeleteProblem = (index: number) => {
        const newProblems = problems.filter((_, idx) => idx !== index);
        setProblems(newProblems);
    };

    if (!pageData) return <div>Loading...</div>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    問題集設定
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="タイトル"
                        value={pageData.title}
                        onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="説明"
                        value={pageData.description}
                        onChange={(e) => setPageData({ ...pageData, description: e.target.value })}
                        fullWidth
                        size="small"
                    />
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    新規問題追加
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="問題"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        fullWidth
                        size="small"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddProblem()}
                    />
                    <TextField
                        label="解答"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        fullWidth
                        size="small"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddProblem()}
                    />
                    <TextField
                        label="解説"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        fullWidth
                        size="small"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddProblem()}
                    />
                    <Button onClick={handleAddProblem} variant="contained" color="secondary">
                        追加
                    </Button>
                </Box>
            </Paper>

            <Box sx={{ mb: 4 }}>
                <Button onClick={handleSave} variant="contained" color="primary">
                    保存
                </Button>
                <Button  variant="contained" color="error" sx={{ ml: 2 }} onClick={() => router.push('/management')}>
                    戻る
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    問題一覧
                </Typography>
                {problems.length === 0 ? (
                    <Typography variant="body1">問題がありません。</Typography>
                ) : (
                    problems.map((p, index) => (
                        <ProblemAccordion
                            key={index}
                            initialProblem={p}
                            index={index}
                            onUpdate={(idx, updated) => {
                                const newProblems = [...problems];
                                newProblems[idx] = updated;
                                setProblems(newProblems);
                            }}
                            onDelete={handleDeleteProblem} // 削除関数を渡す
                        />
                    ))
                )}
            </Paper>
        </Container>
    );
}
