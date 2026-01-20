# 🔧 Configuração do Supabase

## ⚠️ Erro: "Invalid API Key"

Se você está recebendo o erro "Invalid API Key" ao tentar fazer login, significa que a chave do Supabase não está configurada corretamente.

## 📝 Passo a Passo para Configurar

### 1. Obter as Credenciais do Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com/project/srdmyrwuvuqyzgtsvcjj/settings/api)
2. Ou acesse: **Settings > API** no seu projeto Supabase

### 2. Copiar as Credenciais

Você precisará de duas informações:

- **Project URL**: A URL do seu projeto (ex: `https://xxxxx.supabase.co`)
- **anon public key**: A chave pública anônima (uma string longa que começa com `eyJ...`)

### 3. Configurar o Arquivo .env

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua `your_supabase_anon_key_here` pela sua chave real:

```env
VITE_SUPABASE_URL=https://srdmyrwuvuqyzgtsvcjj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (sua chave completa aqui)
```

### 4. Reiniciar o Servidor

Após salvar o arquivo `.env`:

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente: `npm run dev`
3. Recarregue a página no navegador

## ✅ Verificação

Após configurar, você deve conseguir:
- Fazer login
- Criar uma conta
- Registrar abastecimentos
- Ver o histórico

## 🆘 Ainda com Problemas?

1. Verifique se o arquivo `.env` está na raiz do projeto
2. Certifique-se de que não há espaços extras na chave
3. Verifique se reiniciou o servidor após alterar o `.env`
4. Abra o console do navegador (F12) e verifique se há erros

## 📞 Suporte

Se o problema persistir, verifique:
- Se o projeto Supabase está ativo
- Se as políticas RLS (Row Level Security) estão configuradas corretamente
- Se a autenticação está habilitada no Supabase
