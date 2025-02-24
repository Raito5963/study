"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebase-config'; // firebase-config のパスはプロジェクト構成に合わせて調整してください
import { collection, getDocs, } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Typography, Card, CardContent, CardActions, Button, Grid, Box } from '@mui/material';

export default function ExercizePage() {
    const [pages, setPages] = useState<{ id: string; title: string; description: string }[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchPages = async () => {
            const querySnapshot = await getDocs(collection(db, 'pages'));
            const pagesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as { id: string; title: string; description: string }[];
            setPages(pagesData);
        };
        fetchPages();
    }, []);

    return (
        <Box sx={{ padding: '16px' }}>
            <Typography variant="h4" gutterBottom>
                問題集一覧
            </Typography>

            <Button variant="contained" color="error" sx={{ marginBottom: 2 }} onClick={() => router.push('/')}>
                ホームに戻る
            </Button>

            <Grid container spacing={4}>
                {pages.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary">
                            現在、問題集はありません。
                        </Typography>
                    </Grid>
                ) : (
                    pages.map((page) => (
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
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <Button size="small" onClick={() => router.push(`/exercize/${page.id}`)}>
                                        開く
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}
