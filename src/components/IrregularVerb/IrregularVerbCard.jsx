import { Card } from "antd";
import './IrregularVerbCard.css'; // Import the CSS file

function IrregularVerbCard(props) {
    const { verb } = props;

    return (
        <div className="verb-card-container">
            <Card
                title={
                    <div className="verb-title">
                        <span>{verb.infinitive}</span>
                    </div>
                }
                className="verb-card"
            >
                <p className="verb-text">Past Simple: {verb.pastSimple}</p>
                <p className="verb-text">Past Participle: {verb.pastParticiple}</p>
                <p className="verb-text">Перевод: {verb.translationRu}</p>
            </Card>
        </div>
    );
}

export default IrregularVerbCard;