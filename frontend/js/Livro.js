// ========== LIVRO.JS — Cadastro de livro (step1) + CRUD ==========

const Livro = {
    async listar() { return await apiGet('/livros'); },
    async buscar(id) { return await apiGet('/livros/' + id); },
    async criar(data) { return await apiPost('/livros', data); },

    // ----- Init Step 1 -----
    initStep1() {
        if (!requireLogin('livreiro')) return;

        // Carregar categorias
        Categoria.carregarDropdown('id_categoria');

        // ISBN radios
        var isbnInput = document.getElementById('isbn');
        document.querySelectorAll('input[name="isbn_check"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                if (radio.value === 'nao_possui' && radio.checked) {
                    isbnInput.disabled = true;
                    isbnInput.value = '';
                } else {
                    isbnInput.disabled = false;
                }
            });
        });

        // Add foto
        document.getElementById('addPhotoBtn').addEventListener('click', function() {
            document.getElementById('photoInput').click();
        });
        document.getElementById('photoInput').addEventListener('change', function(e) {
            if (e.target.files.length > 0) localStorage.setItem('foto_item', e.target.files[0].name);
        });

        // Voltar
        document.getElementById('voltarBtn').addEventListener('click', function() {
            window.location.href = 'catalogo.html';
        });

        // Continuar
        document.getElementById('continuarBtn').addEventListener('click', async function() {
            var msg = document.getElementById('message');
            msg.className = 'message';
            msg.textContent = '';

            var user = getSession();
            if (!user || user.tipo !== 'livreiro') {
                msg.className = 'message error';
                msg.textContent = 'Erro: faça login como vendedor.';
                return;
            }

            var nome = document.getElementById('nome').value.trim();
            var autor = document.getElementById('autor').value.trim();
            var editora = document.getElementById('editora').value.trim() || null;
            var ano = document.getElementById('ano_publicacao').value || null;
            var isbn = document.getElementById('isbn').value.trim();
            var idCategoria = document.getElementById('id_categoria').value;

            if (!nome || !autor || !isbn || !idCategoria) {
                msg.className = 'message error';
                msg.textContent = 'Preencha: título, autor, ISBN e categoria.';
                return;
            }

            var livroData = {
                nome: nome,
                autor: autor,
                editora: editora,
                ano_publicacao: ano ? parseInt(ano) : null,
                isbn: isbn,
                id_categoria: parseInt(idCategoria),
                id_livreiro: user.id
            };

            try {
                msg.className = 'message loading';
                msg.textContent = 'Cadastrando livro...';
                var result = await Livro.criar(livroData);
                localStorage.setItem('livro_criado_id', result.id_livro);
                localStorage.setItem('livro_criado_nome', nome);
                msg.className = 'message success';
                msg.textContent = 'Livro cadastrado! Redirecionando...';
                setTimeout(function() { window.location.href = 'cadastro-step2.html'; }, 1500);
            } catch (error) {
                msg.className = 'message error';
                msg.textContent = 'Erro ao cadastrar: ' + error.message;
            }
        });
    }
};