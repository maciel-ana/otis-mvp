import React from 'react';
import { Calendar } from './Calendar.jsx';

export function Form({ formData, handleChange, handleSubmit, dateRange, setDateRange, isEditing }) {
  return (
    <form className='registration-form' onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Nome unidade</label>
          <input 
            type='text' 
            name='nome_unidade' 
            placeholder='Ex: Edifício Central'
            value={formData.nome_unidade} 
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>País</label>
          <input 
            type='text' 
            name='pais' 
            placeholder='Ex: Brasil'
            value={formData.pais} 
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Cidade</label>
          <input 
            type='text' 
            name='cidade' 
            placeholder='Ex: São Paulo'
            value={formData.cidade} 
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Responsável Técnico</label>
          <input 
            type='text' 
            name='responsavel_tecnico' 
            placeholder='Ex: Roberto'
            value={formData.responsavel_tecnico} 
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group full-width">
          <label>Data de Início e previsão de término</label>
          <div className="calendario">
            <Calendar range={dateRange} setRange={setDateRange} />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select 
            id='status' 
            name='status'
            value={formData.status}
            onChange={handleChange}
          >
            <option value="planejado">Planejado</option>
            <option value="em andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>

        <div className="form-group">
          <label>Custo Estimado</label>
          <input 
            type="number" 
            name='custo_estimado' 
            placeholder='R$ 60.000'
            value={formData.custo_estimado}
            onChange={handleChange}
          />
        </div>

        <button type='submit' id='submit-button'>
          {isEditing ? 'Salvar Alterações' : 'Registrar Nova Instalação'}
        </button>
      </div>
    </form>
  );
}

export default Form;