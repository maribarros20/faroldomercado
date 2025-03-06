
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditions = ({ isOpen, onClose }: TermsAndConditionsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">Termos e Condições</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mb-4">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <h3 className="font-bold text-lg">1. Aceitação dos Termos</h3>
          <p>
            Ao acessar e utilizar a plataforma Farol do Mercado, você concorda em cumprir e estar vinculado aos seguintes termos e condições. Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar nossos serviços.
          </p>

          <h3 className="font-bold text-lg">2. Descrição do Serviço</h3>
          <p>
            O Farol do Mercado é uma plataforma que fornece serviços de análise de mercado, informações financeiras e ferramentas educacionais. Nossos serviços são destinados apenas para fins informativos e educacionais e não constituem aconselhamento financeiro.
          </p>

          <h3 className="font-bold text-lg">3. Conta de Usuário</h3>
          <p>
            Para acessar determinados recursos da plataforma, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorrem sob sua conta. Você deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.
          </p>

          <h3 className="font-bold text-lg">4. Privacidade</h3>
          <p>
            A coleta e o uso de suas informações pessoais são regidos por nossa Política de Privacidade, que está incorporada a estes Termos e Condições por referência.
          </p>

          <h3 className="font-bold text-lg">5. Propriedade Intelectual</h3>
          <p>
            Todos os conteúdos disponíveis através de nossos serviços, incluindo, mas não se limitando a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, são propriedade do Farol do Mercado ou de seus fornecedores de conteúdo e estão protegidos por leis de direitos autorais brasileiras e internacionais.
          </p>

          <h3 className="font-bold text-lg">6. Restrições de Uso</h3>
          <p>
            Você concorda em não utilizar o serviço para:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Violar qualquer lei aplicável ou regulamento</li>
            <li>Publicar ou transmitir qualquer conteúdo que seja ilegal, ameaçador, abusivo, difamatório ou de outra forma questionável</li>
            <li>Tentar interferir com a operação normal da plataforma</li>
            <li>Acessar ou tentar acessar sistemas ou informações não intencionados para seu uso</li>
          </ul>

          <h3 className="font-bold text-lg">7. Isenção de Responsabilidade</h3>
          <p>
            O conteúdo e as ferramentas fornecidos pela plataforma são apresentados "como estão" e "conforme disponíveis". Não garantimos a precisão, integridade ou utilidade de qualquer informação apresentada. Em nenhum caso seremos responsáveis por quaisquer perdas ou danos diretos, indiretos, incidentais, consequentes ou punitivos resultantes do uso ou incapacidade de usar a plataforma ou qualquer conteúdo nela incluído.
          </p>

          <h3 className="font-bold text-lg">8. Alterações nos Termos</h3>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação dos termos revisados na plataforma. Seu uso continuado da plataforma após tais alterações constitui sua aceitação dos novos termos.
          </p>

          <h3 className="font-bold text-lg">9. Lei Aplicável</h3>
          <p>
            Estes termos serão regidos e interpretados de acordo com as leis brasileiras, sem considerar suas disposições de conflito de leis.
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <Button className="bg-trade-blue hover:bg-trade-dark-blue text-white" onClick={onClose}>
            Entendi e Aceito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;
