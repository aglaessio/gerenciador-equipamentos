// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMINIO.firebaseapp.com",
    databaseURL: "https://SEU_BANCO_DE_DADOS.firebaseio.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_BUCKET.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicialize o Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referência para o banco de dados
const ref = database.ref('dadosProdutoras');

// Função para salvar dados no Firebase
function salvarDado(dado) {
    ref.push(dado);
}

// Função para atualizar dados no Firebase
function atualizarDado(id, dado) {
    ref.child(id).update(dado);
}

// Função para carregar dados do Firebase
function carregarDados() {
    ref.on('value', (snapshot) => {
        const dados = snapshot.val();
        const listaDados = document.getElementById('lista-dados');
        listaDados.innerHTML = ''; // Limpa a tabela

        if (dados) {
            Object.keys(dados).forEach((id) => {
                const dado = dados[id];
                adicionarLinhaTabela({ id, ...dado });
            });
        }
    });
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
            <button class="btn-remover" onclick="removerDado('${dado.id}')">🗑️</button>
            <button class="btn-editar" onclick="editarDado('${dado.id}')">✏️</button>
            <button class="btn-whatsapp" onclick="enviarWhatsApp('${dado.telefone}')">💬</button>
        </td>
    `;
    document.getElementById('lista-dados').appendChild(row);
}

// Função para remover um dado
window.removerDado = (id) => {
    ref.child(id).remove();
};

// Função para editar um dado
window.editarDado = (id) => {
    ref.child(id).once('value', (snapshot) => {
        const dado = snapshot.val();
        if (dado) {
            document.getElementById('evento').value = dado.evento;
            document.getElementById('produtora').value = dado.produtora;
            document.getElementById('produtor').value = dado.produtor;
            document.getElementById('telefone').value = dado.telefone;
            document.getElementById('quantidade').value = dado.quantidade;
            document.getElementById('observacao').value = dado.observacao || '';

            // Atualiza o formulário para salvar a edição
            document.getElementById('form-produtora').onsubmit = (e) => {
                e.preventDefault();

                const novoDado = {
                    evento: document.getElementById('evento').value,
                    produtora: document.getElementById('produtora').value,
                    produtor: document.getElementById('produtor').value,
                    telefone: document.getElementById('telefone').value,
                    quantidade: document.getElementById('quantidade').value,
                    observacao: document.getElementById('observacao').value
                };

                atualizarDado(id, novoDado);
                document.getElementById('form-produtora').reset();
                document.getElementById('form-produtora').onsubmit = submitForm; // Restaura o submit original
            };
        }
    });
};

// Função para enviar mensagem no WhatsApp
window.enviarWhatsApp = (telefone) => {
    const mensagemPadrao = "Olá, espero que esteja tudo bem! Gostaria de lembrar sobre a devolução dos equipamentos de venda de ingressos que ainda não retornaram. Precisamos deles de volta para continuar atendendo outros eventos. Por favor, entre em contato para acertarmos os detalhes da devolução. Agradeço a compreensão e aguardo seu retorno!";
    const linkWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagemPadrao)}`;
    window.open(linkWhatsApp, '_blank');
};

// Função para exportar dados para CSV
window.exportarCSV = () => {
    const dados = [];
    const linhas = document.querySelectorAll("#tabela-dados tbody tr");

    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        const dado = {
            evento: colunas[0].textContent,
            produtora: colunas[1].textContent,
            produtor: colunas[2].textContent,
            telefone: colunas[3].textContent,
            quantidade: colunas[4].textContent,
            observacao: colunas[5].textContent
        };
        dados.push(dado);
    });

    if (dados.length === 0) {
        alert('Nenhum dado para exportar!');
        return;
    }

    const cabecalho = ["Evento", "Produtora", "Produtor", "Telefone", "Quantidade", "Observação"];
    const linhasCSV = dados.map(dado => [
        dado.evento,
        dado.produtora,
        dado.produtor,
        dado.telefone,
        dado.quantidade,
        dado.observacao
    ]);

    const csv = [cabecalho, ...linhasCSV].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'dados_produtoras.csv';
    link.click();
};

// Função para submeter o formulário
function submitForm(e) {
    e.preventDefault();

    const evento = document.getElementById('evento').value;
    const produtora = document.getElementById('produtora').value;
    const produtor = document.getElementById('produtor').value;
    const telefone = document.getElementById('telefone').value;
    const quantidade = document.getElementById('quantidade').value;
    const observacao = document.getElementById('observacao').value;

    // Campos obrigatórios: produtora e quantidade
    if (produtora && quantidade) {
        const novoDado = {
            evento: evento || '-', // Se não preenchido, usa um valor padrão
            produtora,
            produtor: produtor || '-', // Se não preenchido, usa um valor padrão
            telefone: telefone || '-',  // Se não preenchido, usa um valor padrão
            quantidade,
            observacao: observacao || '-' // Se não preenchido, usa um valor padrão
        };

        salvarDado(novoDado);
        document.getElementById('form-produtora').reset();
    } else {
        alert('Preencha os campos obrigatórios: Produtora e Quantidade!');
    }
}

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    // Adicionar dados ao formulário
    document.getElementById('form-produtora').addEventListener('submit', submitForm);
});
