import { Tag } from 'antd';

const SeverityTag = ({ severity }: { severity: string }) => {
    let color;

    switch (severity.toLowerCase()) {
        case 'critical':
            color = '#f50';
            break;
        case 'high':
            color = '#108ee9';
            break;
        case 'medium':
            color = '#2db7f5';
            break;
        case 'low':
            color = '#87d068';
            break;
        default:
            color = '#ccc';
            break;
    }

    return (
        <Tag color={color} key={severity}>
            {severity}
        </Tag>
    );
};

export default SeverityTag;
