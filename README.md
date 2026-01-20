# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 🚀 Configuração Rápida

### ⚙️ Configuração do Supabase

Esta aplicação usa **Supabase** (não Firebase) como backend. Para configurar:

1. Acesse o [Supabase Dashboard](https://app.supabase.com/project/srdmyrwuvuqyzgtsvcjj/settings/api)
2. Vá em **Settings > API**
3. Copie a **URL** e a **anon/public key**
4. Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://srdmyrwuvuqyzgtsvcjj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_aqui
```

> **Nota**: O arquivo `.env` já foi criado automaticamente. Você só precisa preencher a chave `VITE_SUPABASE_PUBLISHABLE_KEY` com sua chave real do Supabase.

### 🏃 Executando

```sh
# Instale as dependências (se ainda não fez)
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# A aplicação estará disponível em http://localhost:8080
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tecnologias Utilizadas

Este projeto utiliza:

- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **React 18** - Biblioteca UI
- **React Router** - Roteamento
- **Supabase** - Backend (autenticação e banco de dados)
- **TanStack Query** - Gerenciamento de estado do servidor
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
