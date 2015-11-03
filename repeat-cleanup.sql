DROP function rep();
CREATE FUNCTION rep() RETURNS INTEGER AS $$
DECLARE x integer;
DECLARE ret integer:=0;

BEGIN

LOOP
  SELECT cleanup() into x;
    IF x = 0 THEN
        EXIT;  -- exit loop
    END IF;
    ret:=ret+x;
END LOOP;

RETURN ret;
 END;
 $$
LANGUAGE plpgsql;

