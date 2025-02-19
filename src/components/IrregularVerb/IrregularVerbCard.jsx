import {Card} from "antd";

function IrregularVerbCard(props) {

    const { verb } = props

    return (
        <div>
            <Card 
                title={
                    <div>
                        <span>{verb.infinitive}</span>

                    </div>
                }

            >
                <p>Past Simple: {verb.pastSimple}</p>
                <p>Past Participle: {verb.pastParticiple}</p>
                <p>Перевод: {verb.translationRu}</p>
            </Card>
        </div>
    )
}
  
  export default IrregularVerbCard;
  