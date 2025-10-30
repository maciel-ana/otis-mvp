import { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import './styles/app.css';
import Form from './components/forms.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom';

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

  const [dateRange, setDateRange] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getElevadores = useCallback(async () => {
    try {
      const q = query(collection(db, 'elevadores'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const elevadoresData = [];
      querySnapshot.forEach((doc) => {
        elevadoresData.push({ id: doc.id, ...doc.data() });
      });
      
      setElevadores(elevadoresData);
    } catch (error) {
      console.error(error);
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

    setEditingId(item.id);
  }, []);

  useEffect(() => {
    getElevadores();
  }, [getElevadores]);

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
      timestamp: new Date()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'elevadores', editingId), dataToSend);
        toast.success("Instalação atualizada com sucesso");
      } else {
        await addDoc(collection(db, 'elevadores'), dataToSend);
        toast.success("Instalação registrada com sucesso!");
      }
      
      setFormData({
        nome_unidade: '', pais: '', cidade: '', responsavel_tecnico: '', status: 'planejado', custo_estimado: ''
      });

      setDateRange(undefined);
      setEditingId(null);
      getElevadores(); 

    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar a instalação.");
    }
  }, [editingId, formData, dateRange, getElevadores]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'elevadores', id));
      toast.success("Instalação deletada com sucesso!");
      getElevadores(); 
    } catch (error) {
      console.error(error);
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
      item.nome_unidade?.toLowerCase().includes(searchLower) ||
      item.pais?.toLowerCase().includes(searchLower) ||
      item.cidade?.toLowerCase().includes(searchLower) ||
      item.responsavel_tecnico?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <ToastContainer autoClose={3000} position="bottom-left" />

      <header>
        <h4 className='logo'>OTIS</h4>
        <h4 className='instalacoes'>Gerenciamento de instalações</h4>
        <NavLink to="/dashboard" className='dash'>Dashboard</NavLink>
        <NavLink to="/" className='instalacoes-app'>Instalações</NavLink>
        <NavLink to="/feedback" className='feedback'>Feedback</NavLink>
      </header>
      <div className='container'>
        <div className="resgistro">
          <h2 className='titulo'>{editingId ? "Editar Instalação" : "Registrar Nova Instalação"}</h2>
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
                <tr key={item.id}>
                  <td>{item.nome_unidade}</td>
                  <td>{`${item.cidade}, ${item.pais}`}</td>
                  <td>{item.responsavel_tecnico}</td>
                  <td>{`${formatarData(item.data_inicio)} - ${formatarData(item.previsao_termino)}`}</td>
                  <td><span className={`status-pill ${item.status?.toLowerCase().replace(/ /g, '-')}`}>{item.status}</span></td>
                  <td>{item.custo_estimado}</td>
                  <td className="acoes-cell">
                    <span className="material-symbols-outlined edit" onClick={() => handleEdit(item)}>edit</span>
                    <span className="material-symbols-outlined delete" onClick={() => handleDelete(item.id)}>delete</span>
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