// ========== CATEGORIA.JS — Dropdown de categorias + CRUD ==========

const Categoria = {
    async listar() { return await apiGet('/categorias'); },

    async carregarDropdown(selectId) {
        var select = document.getElementById(selectId);
        if (!select) return;

        var response = await this.listar();
        var categorias = extrairLista(response);

        if (categorias && categorias.length > 0) {
            categorias.forEach(function(cat) {
                var option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nome;
                select.appendChild(option);
            });
        } else {
            var option = document.createElement('option');
            option.value = '';
            option.textContent = 'Erro ao carregar categorias';
            option.disabled = true;
            select.appendChild(option);
        }
    }
};