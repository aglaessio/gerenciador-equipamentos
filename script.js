document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-produtora');
    const listaDados = document.getElementById('lista-dados');
    let editandoId = null;

    // Carregar dados do LocalStorage ao iniciar
    carregarDados();

    // Adicionar dados ao formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const evento = document.getElementById('evento').value;
        const produtora = document.getElementById('produtora').value;
        const produtor = document.getElementById('produtor').value;
        const telefone = formatarTelefone(document.getElementById('telefone').value);
        const quantidade = document.getElementById('quantidade').value;
        const observacao = document.getElementById('observacao').value;

        if (evento && produtora && produtor && telefone && quantidade) {
            const novoDado = {
                id: editandoId || new Date().getTime(),
                evento,
                produtora,
                produtor,
                telefone,
                quantidade,
                observacao
            };

            salvarDado(novoDado);
            adicionarLinhaTabela(novoDado);
            form.reset();
            editandoId = null;
        } else {
            alert('Preencha todos os campos obrigatórios!');
        }
    });

    // Função para salvar dados no LocalStorage
    function salvarDado(dado) {
        let dados = JSON.parse(localStorage.getItem('dadosProdutoras')) || [];
        const index = dados.findIndex(item => item.id === dado.id);

        if (index !== -1) {
            dados[index] = dado; // Atualiza o dado existente
        } else {
            dados.push(dado); // Adiciona novo dado
        }

        localStorage.setItem('dadosProdutoras', JSON.stringify(dados));
    }

    // Função para carregar dados do LocalStorage
    function carregarDados() {
        let dados = JSON.parse(localStorage.getItem('dadosProdutoras')) || [];
        dados.forEach(dado => adicionarLinhaTabela(dado));
    }

    // Função para adicionar uma linha na tabela
    function adicionarLinhaTabela(dado) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Evento">${dado.evento}</td>
            <td data-label="Produtora">${dado.produtora}</td>
            <td data-label="Produtor">${dado.produtor}</td>
            <td data-label="Telefone">${dado.telefone}</td>
            <td data-label="Equipamentos">${dado.quantidade}</td>
            <td data-label="Observação">${dado.observacao || '-'}</td>
            <td class="actions">
                <button class="btn-remover" onclick="removerDado(${dado.id})">🗑️</button>
                <button class="btn-editar" onclick="editarDado(${dado.id})">✏️</button>
                <button class="btn-whatsapp" onclick="enviarWhatsApp('${dado.telefone}')">💬</button>
            </td>
        `;
        listaDados.appendChild(row);
    }

    // Função para remover um dado
    window.removerDado = (id) => {
        let dados = JSON.parse(localStorage.getItem('dadosProdutoras')) || [];
        dados = dados.filter(dado => dado.id !== id);
        localStorage.setItem('dadosProdutoras', JSON.stringify(dados));
        location.reload(); // Recarregar a página para atualizar a tabela
    };

    // Função para editar um dado
    window.editarDado = (id) => {
        let dados = JSON.parse(localStorage.getItem('dadosProdutoras')) || [];
        const dado = dados.find(dado => dado.id === id);

        if (dado) {
            document.getElementById('evento').value = dado.evento;
            document.getElementById('produtora').value = dado.produtora;
            document.getElementById('produtor').value = dado.produtor;
            document.getElementById('telefone').value = dado.telefone;
            document.getElementById('quantidade').value = dado.quantidade;
            document.getElementById('observacao').value = dado.observacao;

            editandoId = dado.id; // Define o ID do dado que está sendo editado
        }
    };

    // Função para enviar mensagem no WhatsApp
    window.enviarWhatsApp = (telefone) => {
        const mensagemPadrao = "Olá, espero que esteja tudo bem! Gostaria de lembrar sobre a devolução dos equipamentos de venda de ingressos que ainda não retornaram. Precisamos deles de volta para continuar atendendo outros eventos. Por favor, entre em contato para acertarmos os detalhes da devolução. Agradeço a compreensão e aguardo seu retorno!";
        const linkWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagemPadrao)}`;
        window.open(linkWhatsApp, '_blank');
    };

    // Função para formatar o telefone
    function formatarTelefone(telefone) {
        // Remove tudo que não é número
        telefone = telefone.replace(/\D/g, '');

        // Formata para o padrão do WhatsApp (55DDNNNNNNNNN)
        if (telefone.length === 11) {
            telefone = `55${telefone}`;
        }

        return telefone;
    }

    // Função para exportar dados para CSV
    window.exportarCSV = () => {
        let dados = JSON.parse(localStorage.getItem('dadosProdutoras')) || [];
        if (dados.length === 0) {
            alert('Nenhum dado para exportar!');
            return;
        }

        const cabecalho = ["Evento", "Produtora", "Produtor", "Telefone", "Quantidade", "Observação"];
        const linhas = dados.map(dado => [
            dado.evento,
            dado.produtora,
            dado.produtor,
            dado.telefone,
            dado.quantidade,
            dado.observacao || '-'
        ]);

        const csv = [cabecalho, ...linhas].map(row => row.join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'dados_produtoras.csv';
        link.click();
    };
});