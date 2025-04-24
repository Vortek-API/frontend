import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(filename: string, data: any[]) {
    if (!data || data.length === 0) {
      console.warn('Nenhum dado disponível para exportar CSV.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Adiciona cabeçalhos
    csvRows.push(headers.join(','));

    // Adiciona linhas de dados
    for (const row of data) {
      const values = headers.map(header => `"${row[header]}"`);
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  exportToPDF(filename: string, data: any[]) {
    if (!data || data.length === 0) {
      console.warn('Nenhum dado disponível para exportar PDF.');
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(14);
    doc.text('Relatório de Dados', 14, 15);

    // Cabeçalhos e linhas
    const headers = [Object.keys(data[0])];
    const rows: RowInput[] = data.map(row => Object.values(row) as RowInput);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 20,
      styles: {
        fontSize: 10
      }
    });

    doc.save(`${filename}.pdf`);
  }
}
