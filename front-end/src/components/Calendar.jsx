import React from "react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export function Calendar({ range, setRange }) {
  
  return (
    <DayPicker
    mode='range'
    selected={range}
    onSelect={setRange}

    locale={ptBR}
    showOutsideDays
    fixedWeeks
    />
  );
}