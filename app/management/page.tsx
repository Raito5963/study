"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Card, CardContent, Grid, Box, CardActions } from '@mui/material';
import { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';  // Use `next/navigation` for routing in App Directory

export default function Management() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pages, setPages] = useState<{ id: string; title: string; description: string }[]>([]);
    const router = useRouter();

    const handleCreate = async () => {
        const docRef = await addDoc(collection(db, 'pages'), {
            title,
            description,
        });
        setOpen(false);
        router.push(`/create/${docRef.id}`); // Navigate to the newly created page
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
        <Box sx={{ padding: '16px' }}>
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ marginBottom: 2 }}>
                新規作成
            </Button>
            <Button variant="contained" color="error" onClick={() => router.push("/")} sx={{ ml : 2 ,marginBottom: 2 }}>
                ホームに戻る
            </Button>

            {/* Create Page Dialog */}
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

            {/* Created Pages List */}
            <Typography variant="h6" gutterBottom>
                作成したページ
            </Typography>

            <Grid container spacing={4}>
                {pages.map((page) => (
                    <Grid item xs={12} sm={6} md={4} key={page.id}>
                        <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {page.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {page.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => router.push(`/create/${page.id}`)}
                                >
                                    開く
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
