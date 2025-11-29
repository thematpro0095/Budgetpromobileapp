import React, { useState, useEffect } from 'react';

const logoDefinitiva = "/logo.png";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentScreen('dashboard'), 500);
          return 100;
        }
        return prev + 8.33;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (currentScreen === 'splash') {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: '#046bf3',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div
          style={{ 
            marginBottom: '2rem', 
            maxWidth: '100%',
            opacity: 1,
            transform: 'scale(1)'
          }}
        >
          <img 
            src={logoDefinitiva} 
            alt="BudgetPro" 
            style={{ 
              width: 'clamp(120px, 25vw, 160px)', 
              height: 'clamp(120px, 25vw, 160px)',
              maxWidth: '160px',
              maxHeight: '160px'
            }} 
          />
        </div>

        <h1
          style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: '900', 
            color: 'white',
            marginBottom: '1rem',
            textAlign: 'center',
            lineHeight: '1.1'
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
        </h1>

        <p
          style={{ 
            fontSize: 'clamp(1.1rem, 4vw, 1.75rem)', 
            color: 'rgba(255,255,255,0.95)', 
            fontWeight: '300',
            marginBottom: '2.5rem',
            textAlign: 'center',
            maxWidth: '90%',
            lineHeight: '1.4'
          }}
        >
          Seu melhor aplicativo para finanças e economia
        </p>

        <div
          style={{ 
            position: 'relative', 
            width: 'clamp(80px, 20vw, 128px)', 
            height: 'clamp(80px, 20vw, 128px)', 
            marginBottom: '2.5rem' 
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 'clamp(10px, 2.5vw, 16px)',
                height: 'clamp(10px, 2.5vw, 16px)',
                backgroundColor: 'white',
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                marginLeft: `${-20 + Math.cos((i * 30) * Math.PI / 180) * 40}px`,
                marginTop: `${-20 + Math.sin((i * 30) * Math.PI / 180) * 40}px`,
                opacity: 0.7,
                animation: `spin ${1.8}s linear infinite ${i * 0.1}s`
              }}
            />
          ))}
        </div>

        <div
          style={{ 
            width: '100%', 
            maxWidth: 'min(90vw, 480px)',
            padding: '0 1rem'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '0.75rem',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
          }}>
            <span style={{ fontWeight: '500', color: 'white' }}>
              Carregando...
            </span>
            <span style={{ fontWeight: '500', color: 'white' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '9999px', 
            height: '8px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #046bf3 0%, #22c55e 100%)',
                borderRadius: '9999px',
                width: `${progress}%`
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#046bf3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: 'white', padding: '1rem' }}>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 8vw, 3rem)', 
          fontWeight: '900',
          marginBottom: '1rem'
        }}>
          ✅ SPLASH PERFEITO!
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.25rem)',
          maxWidth: '90%'
        }}>
          Responsivo + 12s + Bolinhas brancas + % animado
        </p>
      </div>
    );
  }
}
