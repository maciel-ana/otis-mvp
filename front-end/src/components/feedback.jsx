import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/feed.css';
import { Rating } from 'react-simple-star-rating';
import { NavLink } from 'react-router-dom';

function Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [mediaSatisfacao, setMediaSatisfacao] = useState(null);
    const [elevadores, setElevadores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const [nota, setNota] = useState(0);
    const [nomeCliente, setNomeCliente] = useState('');
    const [idElevador, setIdElevador] = useState('');
    const [comentario, setComentario] = useState('');

    useEffect(() => {
        getFeedbacks();
        getElevadores();
    }, []);

    const getElevadores = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'elevadores'));
            const elevadoresData = [];
            
            querySnapshot.forEach((doc) => {
                elevadoresData.push({ id: doc.id, ...doc.data() });
            });
            
            setElevadores(elevadoresData);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar elevadores");
        }
    };

    const getFeedbacks = async () => {
        try {
            const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const feedbacksData = [];
            let somaNotas = 0;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                feedbacksData.push({ id: doc.id, ...data });
                somaNotas += data.nota;
            });
            
            setFeedbacks(feedbacksData);
            
            if (feedbacksData.length > 0) {
                const media = (somaNotas / feedbacksData.length).toFixed(2);
                setMediaSatisfacao({
                    media: parseFloat(media),
                    total: feedbacksData.length
                });
            } else {
                setMediaSatisfacao({
                    media: 0,
                    total: 0
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar feedbacks");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nota || !nomeCliente || !idElevador) {
            return toast.warn("Preencha todos os campos obrigatórios");
        }

        try {
            await addDoc(collection(db, 'feedbacks'), {
                id_elevador: idElevador,
                nome_cliente: nomeCliente,
                nota: nota,
                comentario: comentario,
                timestamp: new Date()
            });

            toast.success("Feedback enviado com sucesso!");
            setNota(0);
            setNomeCliente('');
            setIdElevador('');
            setSearchTerm('');
            setComentario('');
            getFeedbacks();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar feedback");
        }
    };

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
            <ToastContainer autoClose={3000} position='bottom-left' />
            <header>
                <h4 className="logo">OTIS</h4>
                <NavLink to='/dashboard' className='dash'>Dashboard</NavLink>
                <NavLink to='/' className='feed-instalacoes'>Instalações</NavLink>
                <NavLink to="/feedback" className='feed-feedback'>Feedback</NavLink>
            </header>
            <div className="feed-titulo">
                <h2 className='feed-registrar'>Registrar Feedback Cliente</h2>
            </div>
            <div className="feed-content-wrapper">
                <div className="container-feed">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row-feed">

                            <div className="form-group-feed">
                                <label>Nome do Cliente</label>
                                <input 
                                    type="text" 
                                    className='feed-cliente'
                                    name="nome_cliente" 
                                    placeholder='Digite seu nome'
                                    value={nomeCliente}
                                    onChange={(e) => setNomeCliente(e.target.value)}
                                />
                            </div>

                            <div className="form-group-feed">
                                <label>Instalação relacionada</label>
                                <input 
                                    type="text" 
                                    placeholder='Selecione ou pesquise a instalação'
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                
                                {showDropdown && searchTerm && filteredElevadores.length > 0 && (
                                    <div className="dropdown-instalacoes">
                                        {filteredElevadores.map((item) => (
                                            <div 
                                                key={item.id}
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setIdElevador(item.id); 
                                                    setSearchTerm(`${item.nome_unidade} - ${item.cidade}, ${item.pais}`);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <strong>{item.nome_unidade}</strong>
                                                <span>{item.cidade}, {item.pais}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group-feed">
                                <label>Nota</label>
                                <Rating
                                    onClick={(rate) => setNota(rate)}
                                    initialValue={nota}
                                    size={30}
                                    fillColor='orange'
                                    emptyColor='gray'
                                />
                            </div>
                            
                            <div className="form-group-feed">
                                <label>Comentário</label>
                                <textarea
                                    placeholder='Descreva sua experiência'
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="btns">
                            <button type='button' className='reset' onClick={() => {
                                setNota(0);
                                setNomeCliente('');
                                setIdElevador('');
                                setSearchTerm(''); 
                                setComentario('');
                            }}>Cancelar</button>
                            <button type='submit' className='submit'>Enviar Feedback</button>
                        </div>
                    </form>
                </div>
                
                {mediaSatisfacao !== null && (
                    <div className='media-container'>
                        <h3>Média Geral de satisfação</h3>
                        <p className='media-numero'>
                            {mediaSatisfacao.media > 0 ? mediaSatisfacao.media : '—'}
                        </p>
                        {mediaSatisfacao.total > 0 && (
                            <Rating
                                initialValue={mediaSatisfacao.media}
                                readonly={true}
                                size={30}
                                fillColor='#FFA500'
                                emptyColor='#CBD5E1'
                            />
                        )}
                        <p style={{marginTop: '15px'}}>
                            {mediaSatisfacao.total > 0 
                                ? `Baseado em ${mediaSatisfacao.total} ${mediaSatisfacao.total === 1 ? 'avaliação' : 'avaliações'}`
                                : 'Nenhuma avaliação ainda'
                            }
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Feedback;