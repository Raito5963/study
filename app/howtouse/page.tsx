"use client";
import { Button, Container, Typography, Accordion, AccordionSummary, AccordionDetails, } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';

    const router = useRouter();
export default function Home() {
    return (
        <Container maxWidth="md">
            <Typography variant="h3" gutterBottom align="center" sx={{
                color: "error.main",
                fontWeight: "bold",
                fontSize: { xs: "2rem", sm: "4rem", md: "6rem" },
            }}>
                Study Goの使い方！
            </Typography>
            <Button variant="contained" color="error" onClick={() => router.push('/')}>
                ホームに戻る
            </Button>
            {/* CreatePage Usage */}
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="create-page-content"
                    id="create-page-header"
                >
                    <Typography
                        sx={{
                            color: "error.main",
                            fontWeight: "bold",
                            fontSize: { xs: "2rem", sm: "4rem", md: "6rem" },
                        }}
                        variant="h6">CreatePageの使い方</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        1. <strong>問題文の入力</strong>: 問題を入力するテキストボックスに質問文を入力します。<br />
                        2. <strong>解答の入力</strong>: 解答欄に正しい解答を入力します。<br />
                        3. <strong>解説の入力 (省略可能)</strong>: 問題に関する解説を入力する欄があります。解説は必須ではありませんが、必要に応じて入力できます。<br />
                        4. <strong>CSVインポート</strong>: CSV形式で問題を一括インポートできます。<br />
                        <Typography variant="body2" color="textSecondary" mt={2}>
                            <strong>CSV形式の例:</strong><br />
                            問題1, 解答1, 解説1<br />
                            問題2, 解答2, 解説2<br />
                            問題3, 解答3
                        </Typography>
                    </Typography>
                </AccordionDetails>
            </Accordion>

            {/* ExercizePage Usage */}
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="exercize-page-content"
                    id="exercize-page-header"
                >
                    <Typography variant="h6">ExercisePageの使い方</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        1. <strong>問題の選択</strong>: 解きたい問題を選択します。<br />
                        2. <strong>解答の入力</strong>: 解答欄に答えを入力します。<br />
                        3. <strong>結果の確認</strong>: 提出後、正解・不正解の結果が表示されます。<br />
                        4. <strong>解説の確認</strong>: 解答後、不正解の時は解説を確認できます。<br />
                        5. <strong>順番モード</strong>: 順番モードのチェックボックスを押すことで問題の出力を順番にできます。<br />
                    </Typography>
                </AccordionDetails>
            </Accordion>

            {/* CSV Import Section */}
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="csv-import-content"
                    id="csv-import-header"
                >
                    <Typography variant="h6">CreateのCSVインポートのやり方</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        1. CSV形式で問題を準備します。問題、解答、解説の順で記入してください。解説は省略可能です。<br />
                        2. <strong>CSVファイルをアップロード</strong>: CreatePageの「CSVインポート」ボタンをクリックして、CSVファイルを選択します。<br />
                        3. アップロード後、問題が自動的に作成されます。<br />
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Container>
    );
}
