import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles/app.css';
import Form from './components/forms.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = "http://localhost:8800/api/elevadores";

function App() {

  const [elevadores, setElevadores] = useState([]);

  const [formData, setFormData] = useState({
    nome_unidade: '',
    pais: '',
    cidade: '',
    responsavel_tecnico: '',
    status: 'planejado',
    custo_estimado: ''
  });

  const [ dateRange, setDateRange] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getElevadores = useCallback( async () => {
    try {
      const res = await axios.get(API_URL);
      setElevadores(res.data.sort((a,b) => b.id_elevador - a.id_elevador));
    } catch (error){
      toast.error("Falha ao buscar os dados das instalações");
    }
  }, []);

  const handleEdit = useCallback((item) => {
    setFormData({
      nome_unidade: item.nome_unidade,
      pais: item.pais,
      cidade: item.cidade,
      responsavel_tecnico: item.responsavel_tecnico,
      status: item.status,
      custo_estimado: item.custo_estimado
    });

    setDateRange({
      from: new Date(item.data_inicio),
      to: new Date(item.previsao_termino)
    });

    setEditingId(item.id_elevador);
  }, []);

  useEffect(() => {
    getElevadores();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    console.log("Estado do formulario ao enviar", formData);

    if (!dateRange || !dateRange.from || !dateRange.to) {
      return toast.warn("Por favor, selecione uma data de início e término.");
    }

    if (Object.values(formData).some(value => value === '')) {
      return toast.warn("Preencha todos os campos!");
    }

    const dataToSend = {
      ...formData,
      data_inicio: dateRange.from.toISOString().split('T')[0],
      previsao_termino: dateRange.to.toISOString().split('T')[0],    
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, dataToSend);
        toast.success("Instalação atualizada com sucesso");
      } else {
        await axios.post(API_URL, dataToSend);
        toast.success("Instalação registrada com sucesso!");
      }
      
      setFormData({
        nome_unidade: '', pais: '', cidade: '', responsavel_tecnico: '', status: 'planejado', custo_estimado: ''
      });

      setDateRange(undefined);
      setEditingId(null)
      getElevadores(); 

    } catch (error) {
      toast.error("Erro ao registrar a instalação.");
    }
  }, [editingId, formData, dateRange, getElevadores]);

  const handleDelete = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Instalação deletada com sucesso!");
      getElevadores(); 
    } catch (error) {
      toast.error("Erro ao deletar a instalação.");
    }
  }, [getElevadores]);

  function formatarData(dataString) {
    if (!dataString) return 'N/D'; 
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR'); 
  }

  const filteredElevadores = elevadores.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nome_unidade.toLowerCase().includes(searchLower) ||
      item.pais.toLowerCase().includes(searchLower) ||
      item.cidade.toLowerCase().includes(searchLower) ||
      item.responsavel_tecnico.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <ToastContainer autoClose={3000} position="bottom-left" />

      <header>
        <h4 className='logo'>OTIS</h4>
        <h4 className='instalacoes'>Gerenciamento de instalações</h4>
        <a className='dash'>Dashboard</a>
        <a className='feedback'>Feedback</a>
      </header>
      <div className='container'>
        <div className="resgistro">
          <h2 className='titulo'>{editingId ? "Editar Instalação" : "Registrar Nova Intalação"}</h2>
          <Form 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            dateRange={dateRange}
            setDateRange={setDateRange}
            isEditing={!!editingId}
          />
        </div>
        <div className="listagem_elevadores">
          <div className="action-bar">
            <h2 className='titulo'>Instalações Ativas</h2>
            <div className="search">
              <input 
              type="text" 
              placeholder='Buscar por nome, local...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-symbols-outlined">search</span>
            </div>
          </div>
          <table className='instalacoes-table'>
            <thead>
              <tr>
                <th>Nome Unidade</th>
                <th>Local</th>
                <th>Responsável</th>
                <th>Datas</th>
                <th>Status</th>
                <th>Custo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredElevadores.map((item) => (
                <tr key={item.id_elevador}>
                  <td>{item.nome_unidade}</td>
                  <td>{`${item.cidade}, ${item.pais}`}</td>
                  <td>{item.responsavel_tecnico}</td>
                  <td>{`${formatarData(item.data_inicio)} - ${formatarData(item.previsao_termino)}`}</td>
                  <td><span className={`status-pill ${item.status.toLowerCase().replace(/ /g, '-')}`}>{item.status}</span></td>
                  <td>{item.custo_estimado}</td>
                  <td className="acoes-cell">
                    <span className="material-symbols-outlined edit" onClick={() => handleEdit(item)}>edit</span>
                    <span className="material-symbols-outlined delete" onClick={() => handleDelete(item.id_elevador)}>delete</span>
                  </td>
                </tr>
              ))}
            </tbody>  
          </table>
        </div>
      </div>
    </>
  )
}

export default App