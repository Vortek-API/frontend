import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})

export class ExportService {

  //private base64Logo = 'data:image/png;base64,...';
  

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

    // Logo
    //doc.addImage(this.base64Logo, 'PNG', 10, 5, 30, 15);

    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Dados', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });


    // Cabeçalhos e linhas
    const headers = [['Colaborador', 'CPF', 'Empresa', 'Data', 'Entrada', 'Saída', 'Tempo Total']];
    const body = data.map(item => [
      item.nomeColaborador,
      item.cpfColaborador,
      item.nomeEmpresa,
      item.dataRegistro,
      item.entradaRegistro,
      item.saidaRegistro,
      item.tempoTotal
    ]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 20,
      styles: {
        halign: 'center',
        fontSize: 10,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      headStyles: {
        halign: 'center',
        fillColor: [22, 160, 133], // cor verde-água bonita
        textColor: 255,
        fontStyle: 'bold',
      },
      margin: { top: 10 },
    });

    // Paginação
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, {
        align: 'right'
      });
    }

    doc.save(`${filename}.pdf`); 
  }
}
