# unified-red Dynamic Pages

Dynamic pages are pseudo-pages used to simplify creating pages with identical groups, tabs, and widgets across multiple building automation devices. In building automation systems, it is very common to use the same HMI graphic across multiple devices of the same type, e.g. VAV controllers. Instead of building an individual page for each device, simply make the page **Dynamic** and provide it with instance information to map incoming messages to their corresponding widgets.

A Dynamic page requires:
 - **Instance Name Expression** - must include {x}.
 - **Instances** - the lists of instance **names** and **parameters** must match in length, where **names** refer to the displayed name or perhaps equipment tag and **parameters** refers to a set parameters included in the message topic, such as a device ID, device address, or array index.

&nbsp;  
## Dynamic Page Property:
When the dynamic page property is set on a page (ur_page node), the page will be interpreted as a placeholder within the Unified-RED menu system and not rendered. Instead, multiple instances of the dynamic page will be displayed based on the instance expression(s) provided.

&nbsp;  
## Instance Expressions Property:
The Instance Expression property is set on a page (ur_page node) and consists of two parts: Instance Name and Instance Parameters. 
- **Instance Name** represents the display name of the page. 
- **Instance Parameter** represents one or more identifiers to which the Instance Name should be paired to. These identifiers are used as topic substitution variables. Instance Parameters are expressed as variable-value pairs where a value is a single, range, or comma-separated list of identifiers.

For example, consider the following:
- **Instance Name Expression**: VAV1-{x}
- **Instance Names**: 1,2,3
- **Instance Parameters**: address=4,8,7

Would create three pages - VAV1-1, VAV1-2, VAV1-3 - that reference addresses 4, 8, and 7 respectively.

Instance Names and Parameters can include single values, ranges, or comma-separated list. For example:
| Instance Name  | Instance Parameters                           |
| -------------- | --------------------------------------------- |
| 1              | ws = 1 and index = 200                        |
| 1-5            | w = 8,9,11,12,14A and i = 207,208,210,211,213 |
| 1,12A,3        | x = 9-11 and y = 208-210                      |
| 1-5            | x1 = 1-5 and x2 = 200-204                     |

&nbsp;  
## Topic Patterns:
Topic Patterns are used to filter incoming messages based on the topic and are required if this node is a member of a Dynamic Page. The pattern must include at least one Instance Parameter in braces, e.g. `{x}`. Optionally, the pattern may include `*` as wildcards to represent 0 or more characters in the topic. For example, `*/nvoSpaceTemp{x}/*`.

To illustrate how parameters are substituted in a message topic, consider an air handler dynamic page for AHU-1, 2, and 3 where topics for each air handler are:

| Point Description | Topic |
| ----------------- | ----- |
| AHU-1 Unit Status | glp/0/17qdcee/fb/dev/lon/siot-1/if/Web Server/**0**/nvoStatus_**199** |
| AHU-2 Unit Status | glp/0/17qdcee/fb/dev/lon/siot-1/if/Web Server/**1**/nvoStatus_**200** |
| AHU-3 Unit Status | glp/0/17qdcee/fb/dev/lon/siot-1/if/Web Server/**2**/nvoStatus_**201** |

&nbsp;  
Use the the following topic pattern:

&nbsp; &nbsp; &nbsp; &nbsp; glp/0/17qdcee/fb/dev/lon/siot-1/if/Web Server/**{ws}**/nvoStatus_**{index}**

such that **{ws}** and **{index}** are topic substitution variables defined as instance parameters:

| Instance Name | Instance Parameters |
| ------------- | ------------------- |
| 1-3           | ws = 0-2 and index = 199-201 |
| 1,2,3         | ws = 0,1,2 and index = 199,200,201 |

Note: Only one expression is needed. Both are shown to illustrate the various ways instance names and instance parameters can be expressed.
