import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import PrismicDOM from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import Head from 'next/head';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { Header } from '../../components/Header';
import { useRouter } from 'next/router';
import { useMemo, Fragment } from 'react';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    estimated_read_time: number;
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {

  const router = useRouter();

  const estimatedReadTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    const wordsPerMinute = 200;

    const contentWords = post.data.content.reduce(
      (summedContents, currentContent) => {
        const headingWords = currentContent.heading.split(/\s/g).length;
        const bodyWords = currentContent.body.reduce(
          (summedBodies, currentBody) => {
            const textWords = currentBody.text.split(/\s/g).length;

            return summedBodies + textWords;
          },
          0
        );

        return summedContents + headingWords + bodyWords;
      },
      0
    );

    const minutes = contentWords / wordsPerMinute;
    const readTime = Math.ceil(minutes);

    return readTime;
  }, [post, router.isFallback]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }
  return (
    <>
      <Head>
        <title> {post.data.title} | SpaceTraveling</title>
      </Head>

      <Header />
      <main>
        <div className={styles.Container}>
          <img
            src={post.data.banner.url}
            className={styles.Banner}
            data-testid="banner"
          />
        </div>
        <article className={styles.PostContent}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar size={17} />
            <time>{format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}</time>
            <FiUser size={20} />
            <p>{post.data.author}</p>
            <IoMdTime size={20} />
            <span>{estimatedReadTime} min</span>
          </div>
          <section className={styles.Section}>
            {post.data.content.map(({ heading, body }) => (
              <Fragment key={heading}>
                <h2>{heading}</h2>

                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(body),
                  }}
                />
              </Fragment>
            ))}
          </section>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});
  const post = response;
  post.data.title = post.data.titulo_do_post;
  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  }
};
