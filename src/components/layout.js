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
    <div className="mx-auto mt-3" style={{ maxWidth: "960px" }}>
      <header className="px-3 py-2 mb-5 bg-gray-100">
        <div className="flex justify-between my-1 text-3xl">
          <h1 className="mt-0">
            <Link
              style={{
                boxShadow: `none`,
                color: `inherit`,
                fontWeight: 200
              }}
              to={`/`}
            >
              terrbeardotorg
            </Link>
          </h1>
          <span>
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author.name}
              style={{
                borderRadius: `100%`,
                height: "1em",
                width: "1em",
                marginBottom: "-3px"
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
          </span>
        </div>
      </header>
      <main className="px-1">{children}</main>
      <footer className="px-5 py-2 mt-10 bg-gray-100">
        © Terry Heath {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Layout;
