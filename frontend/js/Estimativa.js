// ========== ESTIMATIVA.JS — Criar estimativa + CRUD ==========

const Estimativa = {
    async listar() { return await apiGet('/estimativas'); },
    async buscar(id) { return await apiGet('/estimativas/' + id); },

    async criar(itemId, precoEstimado, descricao) {
        var data = {
            preco_estimado: parseFloat(precoEstimado),
            possivel_descricao: descricao,
            id_item: parseInt(itemId)
        };
        try {
            return await apiPost('/estimativas', data);
        } catch (error) {
            console.error('Erro ao criar estimativa:', error.message);
            return null;
        }
    }
};