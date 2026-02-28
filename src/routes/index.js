import { Router } from 'express';
import { autenticar, permitir } from '../middlewares/auth.js';
import logarNoSistema from '../controllers/authController.js';
import { cadastrarUsuario, listarUsuarios, atualizarPerfil } from '../controllers/usuarioController.js';
import { cadastrarProduto, listarProdutos, buscarProdutoPorId, atualizarProduto, excluirProduto } from '../controllers/produtoController.js';
import { registrarEntrada, registrarSaida, listarMovimentacoes } from '../controllers/movimentacaoController.js';
import verificarEstoque from '../controllers/relatorioController.js';

const router = Router();

// Autenticação
router.post('/auth/login', logarNoSistema);

// Usuários
router.post('/usuarios', autenticar, permitir('admin'), cadastrarUsuario);
router.get('/usuarios', autenticar, permitir('admin'), listarUsuarios);
router.patch('/usuarios/:id/perfil', autenticar, permitir('admin'), atualizarPerfil);

// Produtos
router.post('/produtos', autenticar, permitir('admin', 'estoquista'), cadastrarProduto);
router.get('/produtos', autenticar, listarProdutos);
router.get('/produtos/:id', autenticar, buscarProdutoPorId);
router.patch('/produtos/:id', autenticar, permitir('admin', 'estoquista'), atualizarProduto);
router.delete('/produtos/:id', autenticar, permitir('admin'), excluirProduto);

// Movimentações
router.post('/movimentacoes/entrada', autenticar, permitir('admin', 'estoquista'), registrarEntrada);
router.post('/movimentacoes/saida', autenticar, permitir('admin', 'estoquista'), registrarSaida);
router.get('/movimentacoes', autenticar, permitir('admin', 'estoquista', 'consulta'), listarMovimentacoes);

// Relatórios
router.get('/relatorios/baixo-estoque', autenticar, verificarEstoque);

export default router;