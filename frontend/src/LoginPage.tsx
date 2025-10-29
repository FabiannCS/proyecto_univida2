// en frontend/src/LoginPage.tsx
import React, { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 1. Importa 'CssBaseline' para ayudar con el fondo
import { TextField, Button, Container, Typography, Box, Avatar, CssBaseline } from '@mui/material';
// 2. CAMBIA EL ÍCONO: Importa el nuevo ícono de "escudo"
//import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'; 
import UserOutlined from '@mui/icons-material/PersonOutline';


function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        setError(''); 
        setLoading(true); 

        axios.post('http://127.0.0.1:8000/api/token/', {
            username: username,
            password: password
        })
.then(response => {
    setLoading(false);
    const accessToken = response.data.access; // Guarda el token

    // 1. Guarda el token en el navegador
    localStorage.setItem('accessToken', accessToken);

    try {
        // 2. Decodifica el token para leer la información
        const decodedToken: { rol: string, username: string } = jwtDecode(accessToken);

        // 3. Lee el rol del usuario
        const userRole = decodedToken.rol;
        console.log('Rol del usuario:', userRole); // Para verificar

        // 4. Redirige según el rol
        switch (userRole) {
            case 'ADMIN':
                navigate('/admin-dashboard');
                break;
            case 'AGENTE':
                navigate('/agente-dashboard');
                break;
            case 'CLIENTE':
                navigate('/mi-poliza');
                break;
            default:
                // Si el rol no es reconocido, envía a una página genérica o de error
                console.error('Rol desconocido:', userRole);
                navigate('/'); // Vuelve al login o a una página de error
        }
        } catch (error) {
        console.error('Error al decodificar el token:', error);
        setError('Hubo un problema al procesar el inicio de sesión.');
        // Opcional: Borra el token si falló la decodificación
        localStorage.removeItem('accessToken');
    }
})
        .catch(error => {
            setLoading(false);
            setError('Usuario o contraseña incorrectos.');
        });
    };

    return (
        // 3. CAMBIO DE FONDO: Contenedor principal para el degradado
        <Container 
            component="main" 
            maxWidth={false} // <-- Ocupa todo el ancho
            disableGutters    // <-- Sin márgenes
            sx={{
                minHeight: '100vh', // <-- Ocupa toda la altura
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // ¡AQUÍ ESTÁ TU DEGRADADO!
                background: 'linear-gradient(to bottom, #333333, #000000)', // <-- De gris oscuro a negro
            }}
        >
            <CssBaseline /> 
            
            {/* 4. CAMBIO DE TARJETA: La tarjeta ahora será blanca para contrastar */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,  // <-- Más padding
                    borderRadius: 5, // <-- Bordes más redondeados
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)', // <-- Sombra más pronunciada
                    background: '#ffffff', // <-- Fondo blanco
                    color: '#000000', // <-- Texto negro
                    width: '100%',
                    maxWidth: '420px',
                }}
            >
                {/* 5. CAMBIO DE LOGO: Cambiamos el ícono y el color */}
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 60, height: 60}}> 
                    <UserOutlined sx={{width: 45, height: 45}}/> {/* <-- ¡Tu nuevo ícono! */}
                </Avatar>
                
                <Typography component="h1" variant="h5"
                    sx={{fontFamily: "'Michroma', sans-seriff",
                    fontWeith: 900, fontSize: '1.8rem', color: '#333333'
                    }}>
                    <center>Seguros Univida</center> 
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%'}}>
                    <TextField
                        label="Usuario"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required 
                        onChange={e => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        onChange={e => setPassword(e.target.value)}
                        
                    />

                    {error && (
                        <Typography color="error" align="center" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        disabled={loading} 
                        sx={{ mt: 3, mb: 2, padding: '10px', borderRadius: '15px', fontFamily:"'Michroma', sans-seriff", fontWeight: 400, fontSize: '1rem'}} // <-- Botón más grande
                    >
                        
                        {loading ? "Cargando..." : "Iniciar Sesión"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;