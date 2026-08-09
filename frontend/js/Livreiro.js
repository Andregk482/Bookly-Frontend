// ========== LIVREIRO.JS — Tudo do livreiro: login, signup, CRUD ==========

const Livreiro = {
    // ----- API -----
    async listar() { return await apiGet('/livreiros'); },
    async buscar(id) { return await apiGet('/livreiros/' + id); },
    async criar(data) { return await apiPost('/livreiros', data); },

    // ----- Login -----
    async login(login, senha) {
        var response = await this.listar();
        var users = extrairLista(response);
        if (!users) return { success: false, message: 'Erro ao conectar com o servidor.' };
        var user = users.find(function(u) { return u.login === login && u.senha === senha; });
        if (!user) return { success: false, message: 'Login ou senha incorretos.' };
        setSession({ id: user.id_livreiro, tipo: 'livreiro', login: user.login, primeiro_nome: user.primeiro_nome, email: user.email });
        return { success: true, nome: user.primeiro_nome };
    },

    // ----- Signup -----
    async signup(formData) {
        // Validar
        if (!formData.login || !formData.senha || !formData.usuario || !formData.cpf || !formData.email || !formData.primeiro_nome)
            return { success: false, message: 'Preencha todos os campos obrigatórios (*).' };
        if (formData.cpf.length !== 11) return { success: false, message: 'CPF deve ter 11 dígitos.' };
        if (formData.senha.length < 6) return { success: false, message: 'Senha deve ter no mínimo 6 caracteres.' };

        try {
            var result = await this.criar(formData);
            setSession({ id: result.id_livreiro, tipo: 'livreiro', login: formData.login, primeiro_nome: formData.primeiro_nome, email: formData.email });
            return { success: true, nome: formData.primeiro_nome };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ----- Init página de login (quando for vendedor) -----
    initLogin(loginTipo) {
        // Chamado pelo HTML quando o toggle estiver em "Vendedor"
        var form = document.getElementById('loginForm');
        if (!form) return;
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            var msg = document.getElementById('message');
            msg.className = 'message loading';
            msg.textContent = 'Entrando...';
            var result = await Livreiro.login(
                document.getElementById('login').value.trim(),
                document.getElementById('senha').value
            );
            if (result.success) {
                msg.className = 'message success';
                msg.textContent = 'Bem-vindo, ' + result.nome + '!';
                setTimeout(function() { window.location.href = 'catalogo.html'; }, 1000);
            } else {
                msg.className = 'message error';
                msg.textContent = result.message;
            }
        });
    },

    // ----- Init página de signup (quando for vendedor) -----
    initSignup() {
        var form = document.getElementById('signupForm');
        if (!form) return;
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            var msg = document.getElementById('message');
            msg.className = 'message loading';
            msg.textContent = 'Cadastrando...';

            var data = {
                login: document.getElementById('login').value.trim(),
                senha: document.getElementById('senha').value,
                usuario: document.getElementById('usuario').value.trim(),
                cpf: document.getElementById('cpf').value.trim().replace(/\D/g, ''),
                email: document.getElementById('email').value.trim(),
                primeiro_nome: document.getElementById('primeiro_nome').value.trim(),
                segundo_nome: document.getElementById('segundo_nome').value.trim() || null,
                telefone: document.getElementById('telefone').value.trim() || null,
                data_nascimento: document.getElementById('data_nascimento').value || null,
                endereco_rua: document.getElementById('endereco_rua').value.trim() || null,
                endereco_numero: document.getElementById('endereco_numero').value.trim() || null,
                endereco_complemento: document.getElementById('endereco_complemento').value.trim() || null,
                endereco_bairro: document.getElementById('endereco_bairro').value.trim() || null,
                endereco_cidade: document.getElementById('endereco_cidade').value.trim() || null,
                endereco_estado: document.getElementById('endereco_estado').value || null,
                endereco_cep: document.getElementById('endereco_cep').value.trim() || null
            };

            var result = await Livreiro.signup(data);
            if (result.success) {
                msg.className = 'message success';
                msg.textContent = 'Conta criada! Bem-vindo, ' + result.nome + '!';
                setTimeout(function() { window.location.href = 'catalogo.html'; }, 1500);
            } else {
                msg.className = 'message error';
                msg.textContent = result.message;
            }
        });
    }
};