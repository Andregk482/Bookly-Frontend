// ========== ITEM.JS — Step2, Step3, Catálogo + CRUD ==========

const Item = {
    async listar() { return await apiGet('/itens'); },
    async buscar(id) { return await apiGet('/itens/' + id); },
    async criar(data) { return await apiPost('/itens', data); },

    // ----- Init Step 2 -----
    initStep2() {
        if (!requireLogin('livreiro')) return;

        var conservacao = 'Médio';
        var capa = 'Capadura';
        var features = ['Impressão Limitada'];

        document.querySelectorAll('.state-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.state-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                conservacao = btn.dataset.conservacao;
            });
        });

        document.querySelectorAll('.binding-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.binding-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                capa = btn.dataset.capa;
            });
        });

        document.querySelectorAll('.feature-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var f = btn.dataset.feature;
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    features = features.filter(function(x) { return x !== f; });
                } else {
                    btn.classList.add('active');
                    features.push(f);
                }
            });
        });

        var edicaoInput = document.getElementById('edicao');
        document.getElementById('edicaoPlus').addEventListener('click', function() { edicaoInput.value = parseInt(edicaoInput.value || 0) + 1; });
        document.getElementById('edicaoMinus').addEventListener('click', function() { var v = parseInt(edicaoInput.value || 1); if (v > 1) edicaoInput.value = v - 1; });

        document.getElementById('voltarBtn').addEventListener('click', function() { window.location.href = 'cadastro-step1.html'; });

        document.getElementById('continuarBtn').addEventListener('click', function() {
            var msg = document.getElementById('message');
            msg.className = 'message';
            msg.textContent = '';

            var livroId = localStorage.getItem('livro_criado_id');
            if (!livroId) {
                msg.className = 'message error';
                msg.textContent = 'Erro: livro não cadastrado. Volte ao passo 1.';
                return;
            }

            var itemData = {
                conservacao: conservacao,
                tipo_capa: capa,
                raridade: features.join(', '),
                edicao: edicaoInput.value,
                descricao: document.getElementById('descricao').value.trim(),
                dedicatorio: features.includes('Cópia Assinada'),
                id_livro: parseInt(livroId)
            };

            localStorage.setItem('item_data', JSON.stringify(itemData));
            msg.className = 'message success';
            msg.textContent = 'Dados salvos! Redirecionando...';
            setTimeout(function() { window.location.href = 'cadastro-step3.html'; }, 1000);
        });
    },

    // ----- Init Step 3 -----
    initStep3() {
        if (!requireLogin('livreiro')) return;

        var precoInput = document.getElementById('preco');
        var priceWarning = document.getElementById('priceWarning');

        precoInput.addEventListener('input', function() {
            var preco = parseFloat(precoInput.value);
            var sugerido = 59.99;
            if (preco > 0) {
                var diff = ((preco - sugerido) / sugerido) * 100;
                if (diff > 0) { priceWarning.textContent = Math.round(diff) + '% acima do recomendado'; priceWarning.style.color = '#fbbf24'; }
                else if (diff < 0) { priceWarning.textContent = Math.round(Math.abs(diff)) + '% abaixo do recomendado'; priceWarning.style.color = '#6ee7b7'; }
                else { priceWarning.textContent = 'Preço igual ao recomendado'; priceWarning.style.color = '#93c5fd'; }
            } else { priceWarning.textContent = ''; }
        });

        document.getElementById('voltarBtn').addEventListener('click', function() { window.location.href = 'cadastro-step2.html'; });

        document.getElementById('registrarBtn').addEventListener('click', async function() {
            var msg = document.getElementById('message');
            msg.className = 'message';
            msg.textContent = '';

            var preco = parseFloat(precoInput.value);
            if (!preco || preco <= 0) { msg.className = 'message error'; msg.textContent = 'Digite um preço válido.'; return; }

            var livroId = localStorage.getItem('livro_criado_id');
            var itemDataStr = localStorage.getItem('item_data');
            if (!livroId || !itemDataStr) { msg.className = 'message error'; msg.textContent = 'Erro: dados não encontrados.'; return; }

            var itemData = JSON.parse(itemDataStr);
            var foto = localStorage.getItem('foto_item') || null;

            var payload = {
                preco: preco,
                edicao: itemData.edicao || null,
                descricao: itemData.descricao || null,
                conservacao: itemData.conservacao,
                tipo_capa: itemData.tipo_capa,
                raridade: itemData.raridade || null,
                dedicatorio: itemData.dedicatorio || false,
                presenca_de_grifos: false,
                fotos_item: foto,
                id_livro: parseInt(livroId)
            };

            try {
                msg.className = 'message loading';
                msg.textContent = 'Registrando item...';
                var result = await Item.criar(payload);
                // Criar estimativa
                await Estimativa.criar(result.id_item, 59.99, 'Preço sugerido baseado no mercado');
                // Limpar
                localStorage.removeItem('livro_criado_id');
                localStorage.removeItem('livro_criado_nome');
                localStorage.removeItem('item_data');
                localStorage.removeItem('foto_item');
                msg.className = 'message success';
                msg.textContent = 'Item registrado com sucesso! Redirecionando...';
                setTimeout(function() { window.location.href = 'catalogo.html'; }, 2000);
            } catch (error) {
                msg.className = 'message error';
                msg.textContent = 'Erro ao registrar: ' + error.message;
            }
        });
    },

    // ----- Init Catálogo -----
    initCatalog() {
        var allItems = [];
        var allBooks = [];

        var filterToggleBtn = document.getElementById('filterToggleBtn');
        var filterSidebar = document.getElementById('filterSidebar');
        if (filterToggleBtn) {
            filterToggleBtn.addEventListener('click', function() {
                filterSidebar.classList.toggle('active');
                document.getElementById('overlay').classList.toggle('active');
            });
        }
        var overlay = document.getElementById('overlay');
        if (overlay) overlay.addEventListener('click', function() { filterSidebar.classList.remove('active'); });

        var priceRange = document.getElementById('priceRange');
        var priceMaxLabel = document.getElementById('priceMaxLabel');
        if (priceRange) priceRange.addEventListener('input', function() { priceMaxLabel.textContent = 'R$' + priceRange.value; renderProducts(); });

        var searchInput = document.getElementById('searchInput');
        var searchType = document.getElementById('searchType');
        if (searchInput) searchInput.addEventListener('input', renderProducts);
        if (searchType) searchType.addEventListener('change', renderProducts);

        document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(function(cb) {
            cb.addEventListener('change', renderProducts);
        });

        async function loadCatalog() {
            var results = await Promise.all([Item.listar(), Livro.listar()]);
            var items = results[0];
            var livros = results[1];

            if (!items) {
                var loadingMsg = document.getElementById('loadingMsg');
                if (loadingMsg) loadingMsg.textContent = 'Nenhum item disponível no momento.';
                return;
            }

            allItems = extrairLista(items) || [];
            allBooks = extrairLista(livros) || [];
            renderProducts();
        }

        function getCheckedValues(groupName) {
            var target = null;
            document.querySelectorAll('.filter-group').forEach(function(g) {
                var h4 = g.querySelector('h4');
                if (h4 && h4.textContent.includes(groupName)) target = g;
            });
            if (!target) return [];
            return Array.from(target.querySelectorAll('input[type="checkbox"]:checked')).map(function(cb) { return cb.value; });
        }

        function renderProducts() {
            var grid = document.getElementById('productGrid');
            var resultCount = document.getElementById('resultCount');
            if (!grid) return;

            var bookMap = {};
            allBooks.forEach(function(b) { bookMap[b.id_livro] = b; });

            var selectedCondicoes = getCheckedValues('Condição');
            var maxPrice = parseFloat(priceRange ? priceRange.value : 789);
            var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            var searchTypeVal = searchType ? searchType.value : 'all';

            var filtered = allItems.filter(function(item) {
                var book = bookMap[item.id_livro];
                if (!book) return false;
                if (parseFloat(item.preco) > maxPrice) return false;
                if (selectedCondicoes.length > 0 && selectedCondicoes.indexOf(item.conservacao) === -1) return false;
                if (searchTerm) {
                    if (searchTypeVal === 'nome' && book.nome.toLowerCase().indexOf(searchTerm) === -1) return false;
                    if (searchTypeVal === 'autor' && book.autor.toLowerCase().indexOf(searchTerm) === -1) return false;
                    if (searchTypeVal === 'isbn' && book.isbn.toLowerCase().indexOf(searchTerm) === -1) return false;
                    if (searchTypeVal === 'all') {
                        var m = book.nome.toLowerCase().indexOf(searchTerm) !== -1 ||
                                book.autor.toLowerCase().indexOf(searchTerm) !== -1 ||
                                book.isbn.toLowerCase().indexOf(searchTerm) !== -1;
                        if (!m) return false;
                    }
                }
                return true;
            });

            if (resultCount) resultCount.textContent = filtered.length + ' resultado(s)';

            if (filtered.length === 0) {
                grid.innerHTML = '<div class="catalog-message">Nenhum livro encontrado.</div>';
                return;
            }

            grid.innerHTML = filtered.map(function(item) {
                var book = bookMap[item.id_livro];
                var preco = parseFloat(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                var rating = (Math.random() * 1 + 3).toFixed(1);
                var reviews = Math.floor(Math.random() * 500) + 10;
                return '<div class="product-card">' +
                    '<div class="product-img"><span>📚</span></div>' +
                    '<div class="product-info">' +
                        '<span class="product-title">' + book.nome + '</span>' +
                        '<span class="product-author">' + book.autor + '</span>' +
                        '<div class="product-rating"><span class="star">★</span> ' + rating + ' (' + reviews + ')</div>' +
                        '<span class="product-price">R$ ' + preco + '</span>' +
                    '</div>' +
                    '<div class="product-actions">' +
                        '<button class="btn-add-cart" onclick="alert(\'Carrinho não implementado\')">🛒 Add cart</button>' +
                        '<button class="btn-buy-now" onclick="alert(\'Compra não implementada\')">Buy now</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        loadCatalog();
    }
};