import React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import Image from "gatsby-image";

const Layout = ({ location, title, children }) => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.png/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `);

  const { author, social } = data.site.siteMetadata;

  return (
    <div className="mx-auto" style={{ maxWidth: "max-content" }}>
      <header>
        <h1
          style={{
            marginTop: 0
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              color: `inherit`
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
        <div className="flex justify-end my-1 bg-gray-100 text-3xl">
          <Image
            fixed={data.avatar.childImageSharp.fixed}
            alt={author.name}
            style={{
              marginBottom: 0,
              borderRadius: `100%`,
              height: "1em",
              width: "1em",
              marginTop: ".24em"
            }}
            imgStyle={{
              borderRadius: `50%`
            }}
          />
          <a className="ml-2" href={`https://twitter.com/${social.twitter}`}>
            <i className="fab fa-twitter"></i>
          </a>
          <a
            className="ml-2"
            href="https://www.linkedin.com/in/terry-heath-395b4524/"
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a className="ml-2" href="https://github.com/terrbear">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </header>
      <main>{children}</main>
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  );
};

export default Layout;
