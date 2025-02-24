"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TextField, Button } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation'; // Use useRouter from next/navigation

export default function CreatePage() {
    const router = useRouter();
    const pathname = usePathname(); // Get the current path
    const createId = pathname?.split('/')[3]; // Extract the createId from the URL path

    const [pageData, setPageData] = useState<{ title: string; description: string } | null>(null);
    const [problem, setProblem] = useState('');
    const [answer, setAnswer] = useState('');
    const [explanation, setExplanation] = useState('');
    const [problems, setProblems] = useState<{ problem: string; answer: string; explanation: string }[]>([]);

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
                    // 新規ページの場合
                    setPageData({ title: '', description: '' });
                    setProblems([]);
                }
            };
            fetchPageData();
        }
    }, [createId]); // createIdが変わるたびに再実行

    const handleAddProblem = () => {
        if (problem && answer && explanation) {
            setProblems([...problems, { problem, answer, explanation }]);
            setProblem('');
            setAnswer('');
            setExplanation('');
        } else {
            alert('問題、解答、解説をすべて入力してください。');
        }
    };

    const handleSave = async () => {
        if (pageData && createId) {
            const docRef = doc(db, 'pages', createId);
            if ((await getDoc(docRef)).exists()) {
                // 既存ページの更新
                await updateDoc(docRef, {
                    title: pageData.title,
                    description: pageData.description,
                    problems: problems,
                });
                alert('保存しました');
            } else {
                // 新規ページの作成
                await setDoc(docRef, {
                    title: pageData.title,
                    description: pageData.description,
                    problems: problems,
                });
                alert('新しいページを作成しました');
            }
        }
    };

    if (!pageData) return <div>Loading...</div>;

    return (
        <div>
            <TextField
                label="タイトル"
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                fullWidth
                margin="dense"
            />
            <TextField
                label="説明"
                value={pageData.description}
                onChange={(e) => setPageData({ ...pageData, description: e.target.value })}
                fullWidth
                margin="dense"
            />
            <div>
                <TextField
                    label="問題"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="解答"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="解説"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    fullWidth
                />
                <Button onClick={handleAddProblem}>追加</Button>
            </div>

            <Button onClick={handleSave}>保存</Button>

            <div>
                <h3>問題一覧</h3>
                {problems.map((p, index) => (
                    <div key={index}>
                        <p><strong>問題:</strong> {p.problem}</p>
                        <p><strong>解答:</strong> {p.answer}</p>
                        <p><strong>解説:</strong> {p.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
