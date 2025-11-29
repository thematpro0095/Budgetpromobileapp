import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const logoDefinitiva = "/logo.png";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'dashboard'>('splash');
  const [isLoading, setIsLoading] = useState(true);

  // 12 SEGUNDOS
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setCurrentScreen('dashboard'), 500);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  if (currentScreen === 'splash' || isLoading) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, #046bf3 0%, #1e40af 50%, #1e3a8a 100%)'
        }}
      >
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{ marginBottom: '3rem' }}
        >
          <img 
            src={logoDefinitiva} 
            alt="BudgetPro" 
            style={{ 
              width: '160px', 
              height: '160px',
              filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.3))'
            }} 
          />
        </motion.div>

        {/* TÍTULO */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ 
            fontSize: '4.5rem', 
            fontWeight: '900', 
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center',
            lineHeight: '1'
          }}
        >
          Budget
          <span 
            style={{
              background: 'linear-gradient(90deg, #046bf3 0%, #22c55e 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '900'
            }}
          >
            Pro
          </span>
        </motion.h1>

        {/* SUBTÍTULO */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ 
            fontSize: '1.75rem', 
            color: 'rgba(255,255,255,0.95)', 
            fontWeight: '300',
            marginBottom: '3rem',
            textAlign: 'center',
            maxWidth: '32rem',
            padding: '0 1rem'
          }}
        >
          Seu melhor aplicativo para finanças e economia
        </motion.p>

        {/* ✅ 12 BOLINHAS #046BF3 - FORÇADAS COM STYLE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{ 
            position: 'relative', 
            width: '128px', 
            height: '128px', 
            marginBottom: '3rem' 
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                backgroundColor: '#046bf3',
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                marginLeft: `${-25 + Math.cos((i * 30) * Math.PI / 180) * 50}px`,
                marginTop: `${-25 + Math.sin((i * 30) * Math.PI / 180) * 50}px`,
              }}
              animate={{ 
                opacity: [0.3, 1, 0.3], 
                scale: [0.7, 1.3, 0.7] 
              }}
              transition={{ 
                duration: 1.8, 
                repeat: Infinity, 
                delay: i * 0.1 
              }}
            />
          ))}
        </motion.div>

        {/* BARRA DE PROGRESSO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: 'rgba(255,255,255,0.95)' 
            }}>
              Carregando...
            </span>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: 'rgba(255,255,255,0.95)' 
            }}>
              100%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '9999px', 
            height: '8px' 
          }}>
            <motion.div
              style={{
                height: '8px',
                background: 'linear-gradient(90deg, #046bf3 0%, #22c55e 50%, #86efac 100%)',
                borderRadius: '9999px',
                width: '0%'
              }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 11, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(4, 107, 243, 0.05) 0%, rgba(59, 130, 246, 0.03) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900',
          background: 'linear-gradient(90deg, #046bf3 0%, #22c55e 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ✅ SPLASH PERFEITO!
        </h1>
        <p style={{ marginTop: '1.5rem', fontSize: '1.25rem', color: '#374151' }}>
          12 bolinhas #046BF3 + 12 segundos
        </p>
      </div>
    </div>
  );
}
