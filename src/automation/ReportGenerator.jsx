import React, { cloneElement, useState } from 'react';
import { Button } from '@/components/ui/button'; // Importando seu botão padrão
import { createPortal } from 'react-dom'; // <--- IMPORTANTE: Importação necessária
import { FileText, X, Send, Loader2, Download } from 'lucide-react'; // Ícones do seu tema

const ReportGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  // URL do seu Webhook do n8n
  const N8N_WEBHOOK_URL = 'https://bluevelvetmusicstore.app.n8n.cloud/webhook/df06585f-f83e-4376-a389-cf8a01b66f5e';

  const handleGenerateReport = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setReportData(null);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_report' })
      });

      if (!response.ok) throw new Error('Erro ao gerar relatório');
      const data = await response.json();

      // MUDANÇA: Agora pegamos o HTML
      let htmlContent = '';

      if (Array.isArray(data) && data.length > 0) {
        htmlContent = data[0].reportHtml || data[0].reportText;
      } else {
        htmlContent = data.reportHtml || data.reportText;
      }

      setReportData(htmlContent);

    } catch (error) {
      console.error(error);
      setReportData('Erro: Falha ao comunicar com o servidor de relatórios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return;
    setEmailStatus('sending');

    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          email: email,
          reportHtml: reportData
        })
      });
      setEmailStatus('success');
      setTimeout(() => setEmailStatus(''), 3000); // Limpa msg após 3s
    } catch (error) {
      setEmailStatus('error');
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEmailStatus('');
    setEmail('');
  };

  return (
    <>
      {/* BOTÃO PRINCIPAL: 
          Usando o mesmo estilo do botão "Registrar Novo Usuário" 
          (variant="outline" ou "default" conforme sua preferência)
      */}
      {/* 1. O Botão continua no lugar dele (dentro do Card) */}
      <Button onClick={handleGenerateReport} className="gap-2">
        <FileText className="w-4 h-4" />
        Gerar Relatório
      </Button>

      {/* MODAL (Estilizado com Tailwind para combinar com o Dashboard) */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Adicionei 'm-4' para garantir margem em telas pequenas */}
          <div className="bg-card border border-border text-card-foreground w-full max-w-3xl p-6 rounded-xl shadow-2xl relative m-4 animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Relatório de Produtos
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Corpo do Modal */}
            <div className="mb-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Processando dados no N8N...</p>
                </div>
              ) : (
                <div className="bg-secondary/50 p-4 rounded-lg max-h-[300px] overflow-y-auto font-mono text-sm whitespace-pre-wrap border border-border">
                  <div
                    dangerouslySetInnerHTML={{ __html: reportData }}
                    className="report-html-container"
                  />
                </div>
              )}
            </div>

            {/* Rodapé do Modal (Ações) */}
            {!isLoading && reportData && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">Enviar cópia por e-mail:</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleSendEmail} disabled={emailStatus === 'sending' || !email}>
                    {emailStatus === 'sending' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : emailStatus === 'success' ? (
                      'Enviado!'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
                {emailStatus === 'error' && (
                  <p className="text-xs text-red-500">Erro ao enviar. Tente novamente.</p>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ReportGenerator;