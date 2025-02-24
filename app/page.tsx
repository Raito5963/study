
import {
  Button,
  Box,
  Container,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  TextField,
} from "@mui/material";



export default function Home() {


  return (
    <Container>
      <Box sx={{ m: 5 }} >
        <Typography
          textAlign="center"
          fontSize={100}
          variant="h2"
          sx={{
            color: "secondary.main",
            fontWeight: "bold",
          }}
        >
          Study GO
        </Typography>
        <Box sx={{ m: 5, p: 5 }} display="flex" justifyContent="center">
          <Link href="/">
            <Button variant="contained" color="primary" sx={{ height: 100, width: 100, mr: 5 }}>
              Exersize
            </Button>
          </Link>
          <Link href="/management">
            <Button 
            variant="contained" 
            color="success" 
            sx={{ height: 100, width: 100, ml: 5 }}
            >
              Create
            </Button>
          </Link>
        </Box>
      </Box>
    </Container >
  );
}