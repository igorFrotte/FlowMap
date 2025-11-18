import styled from "styled-components";
import { Link } from "react-router-dom";
import logo from "../assets/images/logoFlowMap.png";

export default function Home() {
  return (
    <PageWrapper>
      <NavBar>
        <BrandArea>
          <Logo src={logo} alt="Logo FlowMap" />
          <BrandText>FlowMap</BrandText>
        </BrandArea>

        <NavActions>
          <NavLink to="/login">Entrar</NavLink>
        </NavActions>
      </NavBar>

      <MainContent>
        <HeroSection>
          <HeroText>
            <HeroTitle>
              Organize o seu curso de forma visual e inteligente.
            </HeroTitle>
            <HeroSubtitle>
              Monte o fluxograma de disciplinas, acompanhe o que já foi
              aprovado e planeje os próximos períodos sem depender de
              planilhas confusas.
            </HeroSubtitle>

            <HeroButtons>
              <PrimaryButton to="/login">Entrar</PrimaryButton>
              <SecondaryButton to="/cadastro">Criar minha conta</SecondaryButton>
            </HeroButtons>

            <HelperText>
              Já tem cadastro? Clique em <strong>Entrar</strong>.  
              É novo por aqui? Comece em <strong>Criar minha conta</strong>.
            </HelperText>
          </HeroText>

          <HeroCard>
            <CardTitle>O que você encontra no FlowMap</CardTitle>
            <CardList>
              <li>Visualização do fluxo de disciplinas interativo.</li>
              <li>Planejamento de períodos futuros.</li>
              <li>Acompanhamento de aprovação em cada disciplina.</li>
              <li>Rápido entendimento dos requisitos das matérias.</li>
            </CardList>
            <CardFooterText>
              Tudo em um único lugar, acessível pelo navegador.
            </CardFooterText>
          </HeroCard>
        </HeroSection>

        <Section>
          <SectionTitle>Como funciona</SectionTitle>
          <StepsGrid>
            <StepCard>
              <StepContent>
                <StepNumber>1</StepNumber>
                <StepTitle>Cadastre-se</StepTitle>
              </StepContent>
              <StepText>
                Crie sua conta informando seus dados básicos e vincule-se ao seu curso.
              </StepText>
            </StepCard>

            <StepCard>
              <StepContent>
                <StepNumber>2</StepNumber>
                <StepTitle>Visualize o fluxograma</StepTitle>
              </StepContent>
              <StepText>
                Tenha uma visão ampla de todas as disciplinas, pré-requisitos e dependências.
              </StepText>
            </StepCard>

            <StepCard>
              <StepContent>
                <StepNumber>3</StepNumber>
                <StepTitle>Planeje seus períodos</StepTitle>
              </StepContent>
              <StepText>
                Use o Planejador para distribuir as matérias por semestre, evitando erros de planejamento e sobrecarga.
              </StepText>
            </StepCard>
          </StepsGrid>
        </Section>

        <Section>
          <SectionTitle>Por que usar o FlowMap?</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureTitle>Visão clara do curso</FeatureTitle>
              <FeatureText>
                Enxergue toda a grade em um mapa visual, facilitando decisões
                sobre quais disciplinas cursar em cada período.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureTitle>Menos erros de matrícula</FeatureTitle>
              <FeatureText>
                Evite cursar disciplinas fora de ordem e descubra rápido se
                você atende aos pré-requisitos necessários.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureTitle>Organização contínua</FeatureTitle>
              <FeatureText>
                Acompanhe o que já foi aprovado e o que ainda falta, mantendo
                sempre o controle da sua trajetória acadêmica.
              </FeatureText>
            </FeatureCard>
          </FeaturesGrid>
        </Section>
      </MainContent>

      <Footer>
        <FooterText>
          Após o login, você terá acesso ao Fluxograma, Planejador e aos
          painéis administrativos conforme seu perfil de usuário.
        </FooterText>
      </Footer>
    </PageWrapper>
  );
}

/* ===== styled-components ===== */

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const NavBar = styled.header`
  width: 100%;
  padding: 16px 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0056b3;
`;

const BrandArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
`;

const BrandText = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const NavActions = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  font-size: 0.95rem;
  border-radius: 999px;
  padding: 8px 18px;
  border: 1px solid #1f2937;
  transition: 0.2s;
  background-color: #ffffff;
  color: #1f2937;

  &:hover {
    background-color: #a3c6ee;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px 6% 40px;
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const HeroSection = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.5fr);
  gap: 32px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeroTitle = styled.h1`
  font-size: 2.4rem;
  line-height: 1.2;
  font-weight: 700;
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  max-width: 520px;

  @media (max-width: 900px) {
    max-width: 100%;
    margin: 0 auto;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 900px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const PrimaryButton = styled(Link)`
  text-decoration: none;
  background-color: #ffffff;
  color: #111827;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover {
    background-color: #a3c6ee;
  }
`;

const SecondaryButton = styled(Link)`
  text-decoration: none;
  background-color: transparent;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.95rem;
  border: 1px solid #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  background-color: #0056b3;
  color: white;

  &:hover {
    background-color: #a3c6ee;
    color: #1f2937;
  }
`;

const HelperText = styled.p`
  font-size: 0.9rem;

  strong {
    font-weight: 600;
  }
`;

const HeroCard = styled.div`
  background-color: #699bd5;
  border-radius: 16px;
  padding: 20px 22px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.6);
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  margin-bottom: 12px;
`;

const CardList = styled.ul`
  list-style: disc;
  padding-left: 18px;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CardFooterText = styled.p`
  margin-top: 14px;
  font-size: 0.85rem;
  color: #eef5fd;
`;

const Section = styled.section`
  margin-top: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 20px;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div`
  background-color: #0056b3;
  border-radius: 14px;
  padding: 18px 18px 20px;
  border: 1px solid #1e293b;
`;

const StepContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #a3c6ee;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 10px;
  border: 1px solid #1e293b;
`;

const StepTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 8px;  
`;

const StepText = styled.p`
  font-size: 1rem;
  color: white;
  line-height: 1.5;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background-color: #0056b3;
  border-radius: 14px;
  padding: 18px 18px 20px;
  border: 1px solid #1e293b;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

const FeatureText = styled.p`
  font-size: 1rem;
  color: white;
  line-height: 1.5;
`;

const Footer = styled.footer`
  padding: 16px 6% 20px;
  border-top: 1px solid #1f2937;
  text-align: center;
  font-size: 0.9rem;
  color: white;
  background-color: #0056b3;
`;

const FooterText = styled.p``;
