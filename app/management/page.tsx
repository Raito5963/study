"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';  // Use `next/navigation` for routing in App Directory

export default function Management() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pages, setPages] = useState<{ id: string; title: string; description: string }[]>([]);
    const [isClient, setIsClient] = useState(false);

    const router = useRouter();  // Use it directly here

    const handleCreate = async () => {
        const docRef = await addDoc(collection(db, 'pages'), {
            title,
            description,
        });
        setOpen(false);
        router.push(`/app/create/${docRef.id}`); // Navigate to the newly created page
    };

    useEffect(() => {
        const fetchPages = async () => {
            const querySnapshot = await getDocs(collection(db, 'pages'));
            setPages(querySnapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title || '',
                description: doc.data().description || ''
            })));
        };
        fetchPages();
    }, []);

    return (
        <div>
            <Button variant="contained" onClick={() => setOpen(true)}>
                新規作成
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>新しいページを作成</DialogTitle>
                <DialogContent>
                    <TextField
                        label="タイトル"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="説明"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        キャンセル
                    </Button>
                    <Button onClick={handleCreate} color="primary">
                        作成
                    </Button>
                </DialogActions>
            </Dialog>

            <Typography variant="h6" gutterBottom>
                作成したページ
            </Typography>
            <ul>
                {pages.map((page) => (
                    <li key={page.id}>
                        <Button onClick={() => router.push(`/app/create/${page.id}`)}>{page.title}</Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
