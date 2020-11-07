require('dotenv').config();

const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
AdminBro.registerAdapter(AdminBroMongoose);

const app = express();

const run = async () => {
	mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function () {
		console.log('BD is Connected!');
	});

	const TagSchema = new mongoose.Schema({
		tag: {
			required: true,
			type: String,
		},
		created_at: {
			type: Date,
			default: Date.now(),
		},
	});

	const Tag = mongoose.model('Tag', TagSchema);

	app.use(bodyParser.json());

	const adminBro = new AdminBro({
		dashboard: {
			component: AdminBro.bundle('../dashboard'),
		},
		branding: {
			companyName: 'TCC da Bary',
			logo: 'https://i.ibb.co/ZJhd6Vr/logo.png',
		},
		locale: {
			translations: {
				buttons: {
					filter: 'Filtrar',
					applyChanges: 'Aplicar alterações',
					resetFilter: 'Remover filtros',
					confirmRemovalMany: 'Confirmar a eliminação de {{count}} tag',
					confirmRemovalMany_plural: 'Confirmar a eliminação de {{count}} tags',
					createFirstRecord: 'Adicione a primeira tag.',
				},
				labels: {
					Tag: 'Todas as tags',
					Navigation: 'Navegação',
					filter: 'Filtros',
					selectedRecords: 'Selecionadas ({{selected}})',
					pages: 'Páginas',
				},
				properties: {
					tag: 'Identificação',
					created_at: 'Data de Criação',
				},
				messages: {
					successfullyBulkDeleted: '{{count}} tag foi removida com sucesso',
					successfullyBulkDeleted_plural:
						'{{count}} tags foram removidas com sucesso',
					successfullyDeleted: 'Tag removida com sucesso',
					bulkDeleteError: 'Erro ao deletar tags',
					noRecordsSelected: 'Nenhuma tag foi slecionada',
					theseRecordsWillBeRemoved: 'A seguinte tag será removida',
					theseRecordsWillBeRemoved_plural: 'As seguintes tags serão removidas',
					noRecordsInResource: 'Nenhuma tag encontrada',
					confirmDelete: 'Tem certeza que deseja remover essa tag?',
				},
				actions: {
					list: 'Todas as tags',
					search: 'Procurar',
					delete: 'Deletar',
					bulkDelete: 'Deletar todos os selecionados',
				},
			},
		},
		resources: [
			{
				resource: Tag,
				options: {
					actions: {
						new: {
							isVisible: false,
						},
						edit: {
							isVisible: false,
						},
						show: {
							isVisible: false,
						},
					},
					navigation: {name: 'Tags', icon: 'Tag'},
					properties: {
						_id: {
							isVisible: {list: false, filter: false, show: false, edit: false},
						},
						created_at: {
							isVisible: {list: true, filter: true, show: true, edit: false},
						},
					},
				},
			},
		],
		rootPath: '/admin',
	});
	const router = AdminBroExpress.buildRouter(adminBro);

	app.use(adminBro.options.rootPath, router);

	app.get('/', (req, res) => {
		res.json({message: 'Hello World!'});
	});

	app.post('/tag', async (req, res) => {
		const tag = req.body.tag;

		const newTag = new Tag({tag});
		await newTag.save();
		return res.send('Ok!');
	});

	app.listen(process.env.PORT || 3000, () => {
		console.log(`App listening port ${process.env.PORT || 3000}`);
	});
};

run();
