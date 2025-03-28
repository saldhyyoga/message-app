db = db.getSiblingDB("messageapp");

db.createCollection("messages");
db.createCollection("conversations");
