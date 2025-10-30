// en frontend/src/LoginPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
// Importa componentes de Material-UI
import { TextField, Button, Container, Typography, Box, Avatar, CssBaseline } from '@mui/material';
// Importa el ícono de escudo
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
// Importa las herramientas para decodificar el token y navegar
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const navigate = useNavigate(); // Hook para redirigir
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado para mostrar "Cargando..."

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
            const accessToken = response.data.access;
            localStorage.setItem('accessToken', accessToken);

            try {
                // Decodifica el token para leer el rol
                const decodedToken: { rol: string, username: string } = jwtDecode(accessToken);
                const userRole = decodedToken.rol;
                console.log('Rol del usuario:', userRole);

                // Redirige según el rol
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
                        console.error('Rol desconocido:', userRole);
                        navigate('/'); // Vuelve al login si el rol no es válido
                }
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                setError('Hubo un problema al procesar el inicio de sesión.');
                localStorage.removeItem('accessToken');
            }
        })
        .catch(error => {
            setLoading(false);
            console.error('¡Error en el login!', error);
            setError('Usuario o contraseña incorrectos.');
        });
    };

    return (
        // Contenedor principal con el fondo degradado
        <Container
            component="main"
            maxWidth={false} // Ocupa todo el ancho
            disableGutters    // Sin márgenes internos
            sx={{
                minHeight: '100vh', // Ocupa toda la altura
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // ¡AQUÍ ESTÁ EL DEGRADADO! (Gris oscuro a negro)
                background: 'linear-gradient(to bottom, #333333, #000000)',
            }}
        >
            <CssBaseline /> {/* Ayuda a normalizar estilos y aplicar el fondo */}

            {/* La tarjeta blanca del formulario */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                    borderRadius: 3,
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
                    background: '#ffffff', // Fondo blanco para la tarjeta
                    color: '#000000', // Texto negro dentro de la tarjeta
                    width: '100%',
                    maxWidth: '420px',
                }}
            >
                {/* El ícono de escudo */}
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <ShieldOutlinedIcon />
                </Avatar>

                <Typography component="h1" variant="h5" sx={{ fontFamily: 'Michroma, sans-serif', fontWeight: 700 }}>
                    Seguros Univida
                </Typography>

                {/* El formulario */}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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

                    {/* Mensaje de error */}
                    {error && (
                        <Typography color="error" align="center" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}

                    {/* Botón de Entrar */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading} // Se deshabilita mientras carga
                        sx={{ mt: 3, mb: 2, padding: '10px', fontFamily: 'Michroma, sans-serif', fontWeight: 700}}
                    >
                        {loading ? "Cargando..." : "Iniciar Sesión"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;