import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/feed.css';
import { Rating } from 'react-simple-star-rating';

const API_URL = "http://localhost:8800/api/feedback";

function Feedback() {
    const [ feedbacks, setFeedbacks ] = useState([]);
    const [ mediaSatisfacao, setMediaSatisfacao ] = useState(null);
    const [ elevadores, setElevadores ] = useState([]);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ showDropdown, setShowDropdown] = useState(false);


    const [nota, setNota] = useState(0);
    const [nomeCliente, setNomeCliente] = useState('');
    const [idElevador, setIdElevador] = useState('');
    const [comentario, setComentario] = useState('');

    const getElevadores = async () => {
        try {
            const res = await axios.get("http://localhost:8800/api/elevadores");
            setElevadores(res.data);
        } catch (error) {
            toast.error("Erro ao buscar elevadores");
        }
    };

    useEffect(() => {
        getFeedbacks();
        getMedia();
        getElevadores();
    }, []);

    const getFeedbacks = async () => {
        try {
            const res = await axios.get(API_URL);
            setFeedbacks(res.data);
        } catch (error) {
            toast.error("Erro ao buscar feedbacks");
        }
    };

    const getMedia = async () => {
        try {
            const res = await axios.get(`${API_URL}/media`);
            setMediaSatisfacao(res.data);
        } catch (error) {
            toast.error("Erro ao calcular média");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if( !nota || !nomeCliente || !idElevador) {
            return toast.warn("Preencha todos os campos obrigatórios");
        }

        try {
            await axios.post(API_URL, {
                id_elevador: idElevador,
                nome_cliente: nomeCliente,
                nota: nota,
                comentario: comentario
            });

            toast.success("Feedback enviado com sucesso!");
            setNota(0);
            setNomeCliente('');
            setIdElevador('');
            setSearchTerm('')
            setComentario('');
            getFeedbacks();
            getMedia();
        } catch (error) {
            toast.error("Erro ao enviar feedback");
        }
    };

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
            <ToastContainer autoClose={3000} position='bottom-left' />
            <header>
                <h4 className="logo">OTIS</h4>
                <a href='#' className='dash'>Dashboard</a>
                <a href='/' className='feed-instalacoes'>Instalações</a>
                <a href="/feedback" className='feed-feedback'>Feedback</a>
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
                                    setSearchTerm(e.target.value)
                                    setShowDropdown(true)
                                }}
                                onFocus={() => setShowDropdown(true)}
                                />
                                
                                 {showDropdown && searchTerm && filteredElevadores.length > 0 && (
                                    <div className="dropdown-instalacoes">
                                        {filteredElevadores.map((item) => (
                                            <div 
                                                key={item.id_elevador}
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setIdElevador(item.id_elevador);
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
                                setComentario('');
                            }}>Cancelar</button>
                            <button type='submit' className='submit'>Enviar Feedback</button>
                        </div>
                    </form>
                </div>
                {mediaSatisfacao && (
                    <div className='media-container'>
                        <h3>Média Geral de satisfação</h3>
                        <p className='media-numero'>{mediaSatisfacao.media}</p>
                         <Rating
                            initialValue={mediaSatisfacao.media}
                            readonly={true}
                            size={30}
                            fillColor='#FFA500'
                            emptyColor='#CBD5E1'
                        />
                        <p style={{marginTop: '15px'}}>Baseado em {mediaSatisfacao.total} avaliações</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Feedback;