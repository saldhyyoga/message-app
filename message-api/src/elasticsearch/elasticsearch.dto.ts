interface ElasticsearchMessage {
  _index: string;
  _id: string;
  _score: number;
  _source: {
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
}
