# unified-red User Roles

## Roles
- Level 1: Viewer
- Level 2: Limited Operator
- Level 3: Standard Operator
- Level 4: IT Operator
- Level 5: Security Operator
- Level 6: Reserved
- Level 7: Reserved
- Level 8: Reserved
- Level 9: Tech
- Level 10: Admin

&nbsp;  
## Data Points
| Perm        | Viewer (1) | Limited Operator (2) | Standard Operator (3) | IT Operator (4) | Security Operator (5) | Reserved (6) | Reserved (7) | Reserved (8) | Tech (9) | Admin (10) | Notes |
| ----------- | :--------: | :------------------: | :-------------------: | :-------------: | :-------------------: | :----------: | :----------: | :----------: | :------: | :--------: | ----- |
| Read        | Y          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Write       | N          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |

&nbsp;  
## Dashboards
| Perm        | Viewer (1) | Limited Operator (2) | Standard Operator (3) | IT Operator (4) | Security Operator (5) | Reserved (6) | Reserved (7) | Reserved (8) | Tech (9) | Admin (10) | Notes |
| ----------- | :--------: | :------------------: | :-------------------: | :-------------: | :-------------------: | :----------: | :----------: | :----------: | :------: | :--------: | ----- |
| Read        | Y          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Write       | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |

&nbsp;  
## Trends
| Perm        | Viewer (1) | Limited Operator (2) | Standard Operator (3) | IT Operator (4) | Security Operator (5) | Reserved (6) | Reserved (7) | Reserved (8) | Tech (9) | Admin (10) | Notes |
| ----------- | :--------: | :------------------: | :-------------------: | :-------------: | :-------------------: | :----------: | :----------: | :----------: | :------: | :--------: | ----- |
| View        | Y          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Clear       | N          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Add         | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |
| Edit        | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED API    |
| Delete      | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |

&nbsp;  
## Alarms
| Perm        | Viewer (1) | Limited Operator (2) | Standard Operator (3) | IT Operator (4) | Security Operator (5) | Reserved (6) | Reserved (7) | Reserved (8) | Tech (9) | Admin (10) | Notes |
| ----------- | :--------: | :------------------: | :-------------------: | :-------------: | :-------------------: | :----------: | :----------: | :----------: | :------: | :--------: | ----- |
| View        | Y          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Acknowledge | N          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Clear       | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          |       |
| Add         | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |
| Edit        | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |
| Delete      | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |

&nbsp;  
## Schedules
| Perm        | Viewer (1) | Limited Operator (2) | Standard Operator (3) | IT Operator (4) | Security Operator (5) | Reserved (6) | Reserved (7) | Reserved (8) | Tech (9) | Admin (10) | Notes |
| ----------- | :--------: | :------------------: | :-------------------: | :-------------: | :-------------------: | :----------: | :----------: | :----------: | :------: | :--------: | ----- |
| View        | Y          | Y                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          |       |
| Add         | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |
| Edit        | N          | N                    | Y                     | Y               | Y	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED API **(conflict)** |
| Delete      | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |

&nbsp;  
## Admin
| Page              | Perm        | Viewer (1) | Limited Operator (2) | Standard Operator (3) | IT Operator (4) | Security Operator (5) | Reserved (6) | Reserved (7) | Reserved (8) | Tech (9) | Admin (10) | Notes |
| ----------------- | ----------- | :--------: | :------------------: | :-------------------: | :-------------: | :-------------------: | :----------: | :----------: | :----------: | :------: | :--------: | ----- |
| Users             | Read/Write  | N          | N                    | N                     | N               | Y	                    | -            | -            | -            | N        | Y          |       |
| Roles             | Read/Write  | N          | N                    | N                     | N               | Y	                    | -            | -            | -            | N        | Y          |       |
| Audit Log (future)| Read/Write  | N          | N                    | N                     | N               | Y	                    | -            | -            | -            | N        | Y          |       |
| SMTP Settings     | Read/Write  | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          |       |
| Database Settings | Read/Write  | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          |       |
| Node-RED Editor   | Read/Write  | N          | N                    | N                     | N               | N	                    | -            | -            | -            | Y        | Y          | * Requires Node-RED Editor |