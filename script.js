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

            removerDado(id); // Remove o dado antigo para substituir pelo editado
        }
    });
};

// Função para enviar mensagem no WhatsApp
window.enviarWhatsApp = (telefone) => {
    const mensagemPadrao = "Olá, espero que esteja tudo bem! Gostaria de lembrar sobre a devolução dos equipamentos de venda de ingressos que ainda não retornaram. Precisamos deles de volta para continuar atendendo outros eventos. Por favor, entre em contato para acertarmos os detalhes da devolução. Agradeço a compreensão e aguardo seu retorno!";
    const linkWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagemPadrao)}`;
    window.open(linkWhatsApp, '_blank');
};

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    // Adicionar dados ao formulário
    document.getElementById('form-produtora').addEventListener('submit', (e) => {
        e.preventDefault();

        const evento = document.getElementById('evento').value;
        const produtora = document.getElementById('produtora').value;
        const produtor = document.getElementById('produtor').value;
        const telefone = document.getElementById('telefone').value;
        const quantidade = document.getElementById('quantidade').value;
        const observacao = document.getElementById('observacao').value;

        const novoDado = {
            evento,
            produtora,
            produtor,
            telefone,
            quantidade,
            observacao
        };

        salvarDado(novoDado);
        document.getElementById('form-produtora').reset();
    });
});
