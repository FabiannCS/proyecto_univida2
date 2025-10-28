// JavaScript para UNIVIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('UNIVIDA - Sistema de Seguros cargado');
    
    // Efectos de hover para tarjetas
    const tarjetas = document.querySelectorAll('.tarjeta');
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        tarjeta.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Contador animado (opcional)
    function animarContadores() {
        const contadores = document.querySelectorAll('.numero');
        contadores.forEach(contador => {
            const final = parseInt(contador.textContent);
            let inicio = 0;
            const duracion = 2000; // 2 segundos
            const incremento = final / (duracion / 16);
            
            const timer = setInterval(() => {
                inicio += incremento;
                if (inicio >= final) {
                    contador.textContent = final;
                    clearInterval(timer);
                } else {
                    contador.textContent = Math.floor(inicio);
                }
            }, 16);
        });
    }
    
    // Ejecutar animación cuando la página cargue
    animarContadores();
});