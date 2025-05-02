# Features

- **Using new Next.js 14**
- **New** `/app` dir
- **Routing**, **Layouts**, **Nested Layouts**, and **Layout Groups**
- **Data Fetching**, **Caching**, and **Mutation**
- Uses **client** and **server components** from **React 18**
- **API Routes**
- **Live social media feed** with likes, comments, and profanity filter
- Enhance social media posts using **OpenAI API** with **GPT-3.5-Turbo** model
- **OAuth 2.0 Authentication** through Google, GitHub, and Discord using **NextAuth.js**
- **ORM** using **Prisma**
- **PostgreSQL Database** on **Supabase**
- UI Components built using **NextUI v2.0**
- Styled using **Tailwind CSS**
- **Dark mode** using **next-themes**
- **Payments** using **Stripe**
- Written in **TypeScript**
- **S3 bucket integration** to store images (for profile pictures, posts, etc.)

---

## Run locally

1. **Install dependencies**

   ```bash
   npm install
2. **Copy `.env.example` to `.env.local` and update variables:**

    ```bash
   cp .env.example .env.local

3. **Run the development server:**

     ```bash
   npm run dev


**Database setup**
Setup a PostgreSQL database. I recommend using Supabase as they have a great free tier and are easy to set up.

Put your database URL in the .env.local file under the DATABASE_URL key.

Run the Prisma migrate script to initialize the schema:

```bash
npm run migrate:dev

**S3 Bucket setup**

1. Set up an AWS S3 Bucket to store images. Follow this guide to set up the bucket.

2. Add the necessary credentials and configurations in the .env.local file:

```bash
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_REGION=your-region


**Deployed Link**
