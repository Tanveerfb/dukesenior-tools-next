import Link from "next/link";
import { Container } from "react-bootstrap";
import { BsFillBootstrapFill } from "react-icons/bs";
import { FaNodeJs } from "react-icons/fa";
import { IoLogoFirebase } from "react-icons/io5";
import { RiReactjsFill } from "react-icons/ri";
import { SiKofi } from "react-icons/si";
import { VscVscode } from "react-icons/vsc";

export default function Footer() {
  return (
    <Container
      fluid
      className="py-5 bg-info-subtle d-flex flex-column flex-lg-row justify-content-center"
    >
      <Container>
        <h4>About this web app</h4>
        <ul className="py-2">
          <li>To manage events related with streamers</li>
          <li>To collaborate with others</li>
          <li>To learn and experiment with web coding</li>
          <li>To explore creative ideas</li>
        </ul>
      </Container>
      <Container>
        <h4>Tech used</h4>
        <ul className="py-2">
          <li>
            <Link className=" text-warning fw-bolder" href="https://nodejs.org/en" target="_blank">
              <FaNodeJs />&nbsp;NodeJS
            </Link>
          </li>
          <li>
            <Link className=" text-warning fw-bolder" href="https://react.dev/" target="_blank">
              <RiReactjsFill />&nbsp;ReactJS
            </Link>
          </li>
          <li>
            <Link className=" text-warning fw-bolder" href="https://react-bootstrap.github.io/" target="_blank">
              <BsFillBootstrapFill />&nbsp;React-Bootstrap
            </Link>
          </li>
          <li>
            <Link className=" text-warning fw-bolder" href="https://firebase.google.com/" target="_blank">
              <IoLogoFirebase />&nbsp;Firebase (Google)
            </Link>
          </li>
          <li>
            <Link className=" text-warning fw-bolder" href="https://code.visualstudio.com/" target="_blank">
              <VscVscode />&nbsp;Visual Studio Code
            </Link>
          </li>
        </ul>
      </Container>
      <Container>
        <h4>Dev people</h4>
        <ul className="py-2">
          <li className="p-1">
            <Link className="text-pyro fw-bolder" href="https://www.instagram.com/dukesenior22" target="_blank">
              DukeSenior <br /> (Developer)
            </Link>
          </li>
        </ul>
      </Container>
      <Container>
        <h4>Support devs</h4>
        <ul>
          <li>
            <Link className="text-warning fw-bolder p-1" href="https://ko-fi.com/dukesenior" target="_blank">
              <SiKofi />&nbsp;Ko-Fi
            </Link>
          </li>
        </ul>
      </Container>
    </Container>
  );
}
