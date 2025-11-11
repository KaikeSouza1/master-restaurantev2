// packages/frontend/src/components/ReciboImpressao.tsx

import React from 'react';
import type { Mesa, EmpresaInfo } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ReciboProps {
  mesa: Mesa;
  empresaInfo: EmpresaInfo | null;
}

// Usamos React.forwardRef para que o react-to-print possa acessar este componente
export const ReciboImpressao = React.forwardRef<HTMLDivElement, ReciboProps>(
  ({ mesa, empresaInfo }, ref) => {
    
    // Estilos CSS para impressão térmica 80mm
    // 80mm é aproximadamente 302 pixels de largura
    const styles: { [key: string]: React.CSSProperties } = {
      recibo: {
        width: '300px', // Largura máxima para 80mm
        fontFamily: "'Courier New', Courier, monospace", // Fonte monoespaçada
        fontSize: '12px',
        color: '#000',
        padding: '10px',
        boxSizing: 'border-box',
      },
      header: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: '10px',
      },
      info: {
        borderTop: '1px dashed #000',
        borderBottom: '1px dashed #000',
        padding: '5px 0',
        margin: '10px 0',
      },
      itemLinha: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        margin: '3px 0',
      },
      itemNome: {
        flex: 1,
        wordBreak: 'break-word',
        marginRight: '10px',
      },
      itemTotal: {
        whiteSpace: 'nowrap',
      },
      totalSection: {
        borderTop: '1px solid #000',
        paddingTop: '10px',
        marginTop: '10px',
      },
      totalLinha: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '16px',
        fontWeight: 'bold',
      },
      footer: {
        textAlign: 'center',
        marginTop: '15px',
        fontSize: '11px',
      },
    };

    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div ref={ref} style={styles.recibo}>
        <div style={styles.header}>
          <p>{empresaInfo?.nome || 'Nome da Empresa'}</p>
          <p style={{ fontSize: '11px', fontWeight: 'normal' }}>
            {empresaInfo?.endere}, {empresaInfo?.num}
            <br />
            {empresaInfo?.bairro} - {empresaInfo?.cidade}
          </p>
        </div>

        <div style={styles.info}>
          <p>
            MESA: {mesa.num_quiosque} (PEDIDO: #{mesa.codseq})
          </p>
          <p>
            DATA: {dataFormatada} - {horaFormatada}
          </p>
          <p>DOCUMENTO NÃO FISCAL</p>
        </div>

        <div>
          <div style={styles.itemLinha}>
            <span style={styles.itemNome}><strong>DESCRIÇÃO</strong></span>
            <span style={styles.itemTotal}><strong>TOTAL</strong></span>
          </div>
          <hr />
          {mesa.quitens.map((item, index) => (
            <div key={index} style={styles.itemLinha}>
              <span style={styles.itemNome}>
                {item.qtd}x {item.descricao}
                {item.obs && (
                  <em style={{ fontSize: '10px', display: 'block' }}>
                    &nbsp;&nbsp;OBS: {item.obs}
                  </em>
                )}
              </span>
              <span style={styles.itemTotal}>
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.totalSection}>
          <div style={styles.totalLinha}>
            <span>TOTAL:</span>
            <span>{formatCurrency(mesa.total)}</span>
          </div>
        </div>

        <div style={styles.footer}>
          <p>Obrigado pela preferência!</p>
        </div>
      </div>
    );
  },
);