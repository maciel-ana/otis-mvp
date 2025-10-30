import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NavLink } from 'react-router-dom';
import '../styles/dashboard.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [stats, setStats] = useState({
    total_instalacoes: 0,
    instalacoes_concluidas: 0,
    percentual_concluidas: 0,
    tempo_medio_instalacao: 0,
    custo_medio: 0,
    media_satisfacao: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar instalações
      const instalacoesSnapshot = await getDocs(collection(db, 'elevadores'));
      const instalacoes = [];
      
      instalacoesSnapshot.forEach((doc) => {
        instalacoes.push({ id: doc.id, ...doc.data() });
      });

      // Calcular estatísticas de instalações
      const totalInstalacoes = instalacoes.length;
      const instalacoesConcluidasCount = instalacoes.filter(
        item => item.status === 'concluída' || item.status === 'concluida'
      ).length;
      
      const percentualConcluidas = totalInstalacoes > 0 
        ? Math.round((instalacoesConcluidasCount / totalInstalacoes) * 100)
        : 0;

      // Calcular tempo médio (apenas de instalações concluídas)
      let somaTempos = 0;
      let countComTempo = 0;
      
      instalacoes.forEach(item => {
        if ((item.status === 'concluída' || item.status === 'concluida') 
            && item.data_inicio && item.previsao_termino) {
          const dataInicio = new Date(item.data_inicio);
          const dataTermino = new Date(item.previsao_termino);
          const diffTime = Math.abs(dataTermino - dataInicio);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          somaTempos += diffDays;
          countComTempo++;
        }
      });

      const tempoMedio = countComTempo > 0 ? Math.round(somaTempos / countComTempo) : 0;

      // Calcular custo médio
      let somaCustos = 0;
      let countComCusto = 0;
      
      instalacoes.forEach(item => {
        const custo = parseFloat(item.custo_estimado);
        if (!isNaN(custo) && custo > 0) {
          somaCustos += custo;
          countComCusto++;
        }
      });

      const custoMedio = countComCusto > 0 ? somaCustos / countComCusto : 0;

      // Buscar feedbacks e calcular média de satisfação
      const feedbacksSnapshot = await getDocs(collection(db, 'feedbacks'));
      let somaNotas = 0;
      let totalFeedbacks = 0;

      feedbacksSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.nota) {
          somaNotas += data.nota;
          totalFeedbacks++;
        }
      });

      const mediaSatisfacao = totalFeedbacks > 0 
        ? parseFloat((somaNotas / totalFeedbacks).toFixed(2))
        : 0;

      // Atualizar estado
      setStats({
        total_instalacoes: totalInstalacoes,
        instalacoes_concluidas: instalacoesConcluidasCount,
        percentual_concluidas: percentualConcluidas,
        tempo_medio_instalacao: tempoMedio,
        custo_medio: custoMedio,
        media_satisfacao: mediaSatisfacao
      });

      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados do dashboard");
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <ToastContainer autoClose={3000} position="bottom-left" />
      
      <header>
        <h4 className='logo'>OTIS</h4>
        <NavLink to="/dashboard" className='dash'>Dashboard</NavLink>
        <NavLink to="/" className='instalacoes-app'>Instalações</NavLink>
        <NavLink to="/feedback" className='feedback'>Feedback</NavLink>
      </header>

      <div className='dashboard-container'>
        <h1 className='dashboard-title'>Dashboard de Instalações</h1>
        
        {loading ? (
          <div className='loading'>Carregando dados...</div>
        ) : (
          <div className='metrics-grid'>
            <div className='metric-card'>
              <div className='metric-icon'>
                <span className="material-symbols-outlined">apartment</span>
              </div>
              <div className='metric-content'>
                <h3 className='metric-label'>Total de Instalações</h3>
                <p className='metric-value'>{stats.total_instalacoes}</p>
              </div>
            </div>

            <div className='metric-card'>
              <div className='metric-icon success'>
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className='metric-content'>
                <h3 className='metric-label'>Instalações Concluídas</h3>
                <p className='metric-value'>{stats.percentual_concluidas}%</p>
              </div>
            </div>

            <div className='metric-card'>
              <div className='metric-icon info'>
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div className='metric-content'>
                <h3 className='metric-label'>Tempo Médio de Instalação</h3>
                <p className='metric-value'>{stats.tempo_medio_instalacao} dias</p>
              </div>
            </div>

            <div className='metric-card'>
              <div className='metric-icon warning'>
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className='metric-content'>
                <h3 className='metric-label'>Custo Médio por Instalação</h3>
                <p className='metric-value'>{formatCurrency(stats.custo_medio)}</p>
              </div>
            </div>

            <div className='metric-card'>
              <div className='metric-icon primary'>
                <span className="material-symbols-outlined">star</span>
              </div>
              <div className='metric-content'>
                <h3 className='metric-label'>Média de Satisfação</h3>
                <p className='metric-value'>{stats.media_satisfacao} / 5</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;