import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { Header } from '../components/Header';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    titulo_do_post: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [hasMorePosts, setHasMorePosts] = useState(!!postsPagination.next_page);

  async function handleLoadMorePosts(): Promise<void> {
    const loadMorePostsResponse: ApiSearchResponse = await (
      await fetch(postsPagination.next_page)
    ).json();
    setPosts(oldPosts => [...oldPosts, ...loadMorePostsResponse.results]);
    setHasMorePosts(!!loadMorePostsResponse.next_page);
  }

  return (
    <>
      <Head>
        <title>Posts | SpaceTravelingBlog</title>
      </Head>
      <Header />
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.titulo_do_post}</strong>
                <small>{post.data.subtitle}</small>
                <div className={styles.info}>
                  <FiCalendar size={20} />
                  <time>{format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}</time>
                  <FiUser size={20} />
                  <p>{post.data.author}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {hasMorePosts && (
          <button type="button" className={styles.buttonLoad}
            onClick={handleLoadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
    }
  );
  console.log(postsResponse)
  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
