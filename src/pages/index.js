import React from "react";
import { Link, graphql } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import "../styles/global.css";

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title;
  const posts = data.allMarkdownRemark.edges;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug;
        return (
          <article className="mb-6" key={node.fields.slug}>
            <header className="mb-1">
              <h3 className="text-3xl font-semibold">
                <Link
                  style={{ color: "hsl(220 50% 20%)" }}
                  className="shadow-none"
                  to={node.fields.slug}
                >
                  {title}
                </Link>
              </h3>
            </header>
            <section>
              <p
                style={{ fontFamily: '"Merriweather", serif' }}
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt
                }}
              />
            </section>
            <small className="text-gray-500 text-xs">
              {node.frontmatter.date}
            </small>
          </article>
        );
      })}
    </Layout>
  );
};

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt(pruneLength: 300)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`;
